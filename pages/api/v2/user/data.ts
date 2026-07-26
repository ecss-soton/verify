import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../prisma/client";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "../../auth/[...nextauth]";
import {User,Account,Session} from "@prisma/client"

interface ResponseData {
    user?: User
    accounts?: Account[],
    sessions?: Session[]
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
        await prisma.user.delete({
            where: {
                discordTag: authed.discord.tag,
            }
        });
        return res.status(204)
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

    res.status(200).json({
        user: user,
        accounts: user.accounts,
        sessions: user.sessions,
    });
}