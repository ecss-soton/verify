import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../prisma/client";
import { adminAuth } from "../../../../middleware/adminAuth";

interface ResponseData {
    approved: boolean
    guildId: string
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

    const guildId = req.body?.guildId;

    if (typeof guildId !== 'string' || !guildId) {
        return res.status(400).json({
            error: true,
            message: 'You must provide a guildId in the request body',
        })
    }

    const guild = await prisma.guild.findUnique({
        where: {
            id: guildId,
        },
        select: {
            id: true,
        },
    });

    if (!guild) {
        return res.status(404).json({
            error: true,
            message: 'That guild does not exist',
        })
    }

    await prisma.guild.update({
        data: {
            approved: true,
            updatedAt: new Date(),
        },
        where: {
            id: guildId,
        },
    });

    res.status(200).json({
        approved: true,
        guildId,
    });
}
