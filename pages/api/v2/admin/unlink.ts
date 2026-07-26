import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../prisma/client";
import { adminAuth } from "../../../../middleware/adminAuth";

interface ResponseData {
    unlinked: boolean
}

interface ResponseError {
    error: boolean
    message: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData | ResponseError>
) {
    if (req.method !== "POST") return res.status(405).json({
        error: true,
        message: 'Only HTTP verb POST is permitted',
    });

    const check = await adminAuth(req, res);
    if (check) return;

    if (!req.body.discordId) {
        return res.status(400).json({
            error: true,
            message: 'You must provide a discordId in the request body',
        })
    }

    const user = await prisma.user.findUnique({
        where: {
            discordId: req.body.discordId,
        }
    });

    if (!user || !user.discordId) {
        return res.status(404).json({
            error: true,
            message: 'No linked user found with that discordId',
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

    res.status(200).json({
        unlinked: true,
    });
}
