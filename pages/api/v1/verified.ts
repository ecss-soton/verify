import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../prisma/client";
import {auth} from "../../../middleware/auth";

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
    const check = auth(req, res);
    if (check) return check;

    if (!req.body.userId || !req.body.guildId) {
        return res.status(400).json({
            error: true,
            message: 'You must provide both a userId and guildId in the body of the request',
        })
    }

    const user = await prisma.user.findUnique({
        where: {
            discordId: req.body.userId,
        }
    });

    const guild = await prisma.guild.findUnique({
        where: {
            id: req.body.guildId,
        }
    })

    if (!user || !guild) {
        return res.status(404).json({
            error: true,
            message: 'This user does not exist or is not verified',
        })
    }

    res.status(200).json({
        verified: true,
        roleId: guild.roleId,
        sotonLinkedDate: new Date(user.sotonLinkedDate || 0).toISOString(),
        discordLinkedDate: new Date(user.discordLinkedDate || 0).toISOString(),
    });
}