import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../prisma/client";

interface ResponseData {
    verified: boolean
    roleId: string
    sotonLinkedDate: string
    discordLinkedDate: string
}

interface ResponseError {
    error: boolean
    message: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData | ResponseError>
) {
    if (req.method !== "GET") return res.status(405);

    const user = await prisma.user.findFirst({
        where: {
            discordId: req.body.userId,
        }
    });

    const guild = await prisma.guild.findFirst({
        where: {
            id: req.body.guildId,
        }
    })

    if (!user || !guild) {
        return res.status(404).json({
            error: true,
            message: 'This user does not exist or is not verified in this guild',
        })
    }

    res.status(200).json({
        verified: true,
        roleId: guild.roleId,
        sotonLinkedDate: new Date(user.sotonLinkedDate || 0).toISOString(),
        discordLinkedDate: new Date(user.discordLinkedDate || 0).toISOString(),
    });
}