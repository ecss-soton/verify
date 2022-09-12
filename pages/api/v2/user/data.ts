import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../prisma/client";
import {auth} from "../../../../middleware/auth";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "../../auth/[...nextauth]";
import {User,Account,Session} from "@prisma/client"

interface ResponseData {
    user: User
    accounts: Account[],
    sessions: Session[]
}

interface ResponseError {
    error: boolean
    message: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData | ResponseError>
) {
    if (!(req.method == "GET" || req.method == "DELETE")) return res.status(405).json({
        error: true,
        message: 'Only HTTP verb GET and DELETE are permitted',
    });


    const authed = await unstable_getServerSession(req, res, authOptions);

    if (!authed?.discord.tag) {
        return res.status(401).json({
            error: true,
            message: 'You must be authorized to access this endpoint',
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

    // Doesn't add to audit log as user is only person allowed to access data

    res.status(200).json({
        user: user,
        accounts: user.accounts,
        sessions: user.sessions,
    });
}