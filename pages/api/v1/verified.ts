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
    if (req.method !== "GET") return res.status(405).json({
        error: true,
        message: 'Only HTTP verb GET is permitted',
    });
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

    let accessLog = user.accessLog;

    if (Array.isArray(accessLog)) {
        accessLog.push({ guild: req.body.guildId, time: new Date().toISOString(), endpoint: 'verified' })
    } else {
        accessLog = [];
    }

    await prisma.user.update({
        data: {
            accessLog: accessLog
        },
        where: {
            id: user.id,
        }
    })

    res.status(200).json({
        verified: true,
        roleId: guild.roleId,
        sotonLinkedDate: new Date(user.sotonLinkedDate).toISOString(),
        discordLinkedDate: user.discordLinkedDate ? new Date(user.discordLinkedDate).toISOString() : null,
    });
}