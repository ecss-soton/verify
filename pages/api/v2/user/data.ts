import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../prisma/client";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "../../auth/[...nextauth]";
import {User} from "@prisma/client"

interface ExportedAccount {
    provider: string
    type: string
    providerAccountId: string
    expires_at: number | null
    scope: string | null
}

interface ExportedSession {
    expires: string
}

interface ResponseData {
    exportedAt?: string
    user?: User
    accounts?: ExportedAccount[]
    sessions?: ExportedSession[]
    unlinked?: boolean
}

interface ResponseError {
    error: boolean
    message: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData | ResponseError>
) {
    if (!(req.method == "GET" || req.method == "DELETE" || req.method == "PATCH")) return res.status(405).json({
        error: true,
        message: 'Only HTTP verb GET, DELETE, and PATCH are permitted',
    });


    const authed = await unstable_getServerSession(req, res, authOptions);

    if (!authed?.discord.tag) {
        return res.status(401).json({
            error: true,
            message: 'You must be authorized to access this endpoint',
        })
    }

    if (req.method == "PATCH") {
        const user = await prisma.user.findUnique({
            where: {
                discordTag: authed.discord.tag,
            }
        });

        if (!user || !user.discordId) {
            return res.status(404).json({
                error: true,
                message: 'No linked Discord account found',
            })
        }

        await prisma.account.deleteMany({
            where: {
                userId: user.id,
                provider: 'discord',
            }
        });

        await prisma.user.update({
            data: {
                discordId: null,
                discordTag: null,
                discordLinkedDate: null,
            },
            where: {
                id: user.id,
            }
        });

        return res.status(200).json({
            unlinked: true,
        })
    }

    if (req.method == "DELETE") {
        const user = await prisma.user.findUnique({
            where: {
                discordTag: authed.discord.tag,
            },
            select: {
                id: true,
            }
        });

        if (!user) {
            return res.status(404).json({
                error: true,
                message: 'This user does not exist',
            })
        }

        await prisma.user.delete({
            where: {
                id: user.id,
            }
        });

        return res.status(204).end()
    }

    const user = await prisma.user.findUnique({
        where: {
            discordTag: authed.discord.tag,
        },
        include: {
            accounts: true,
            sessions: true,
        }
    });

    if (!user || !user.discordId || !user.sotonId) {
        return res.status(404).json({
            error: true,
            message: 'This user does not exist or is not verified in this guild',
        })
    }

    // Never export OAuth access/refresh/id tokens or session tokens: they are
    // credentials, not user data. Account metadata and session expiry are enough.
    const {accounts: accountRows, sessions: sessionRows, ...userData} = user;

    // The database stores the surname in `firstName` (see the Azure profile
    // mapping). Present names in the order users expect, matching the v2 user
    // endpoint.
    const exportedUser = {
        ...userData,
        firstName: userData.lastName,
        lastName: userData.firstName,
    };

    const accounts: ExportedAccount[] = accountRows.map(account => ({
        provider: account.provider,
        type: account.type,
        providerAccountId: account.providerAccountId,
        expires_at: account.expires_at,
        scope: account.scope,
    }));

    const sessions: ExportedSession[] = sessionRows.map(session => ({
        expires: session.expires.toISOString(),
    }));

    res.setHeader('Content-Disposition', 'attachment; filename="soton-verify-data.json"');
    res.setHeader('Cache-Control', 'no-store');

    res.status(200).json({
        exportedAt: new Date().toISOString(),
        user: exportedUser,
        accounts: accounts,
        sessions: sessions,
    });
}
