import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../prisma/client";
import {auth} from "../../../../middleware/auth";

interface ResponseData {
    id: string
    name: string
    icon: string
    createdAt: string
    ownerId: string
    susuLink?: string
    roleId: string
    roleName: string
    roleColour: number
    approved: boolean
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
    if (check) return res;

    const guildId = typeof req.query.guildId === 'string' ? req.query.guildId : req.query.guildId[0]
    const guild = await prisma.guild.findUnique({
        where: {
            id: guildId,
        }
    })

    if (!guild) {
        return res.status(404).json({
            error: true,
            message: 'This guild does not exist',
        })
    }

    res.status(200).json({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        createdAt: new Date(guild.createdAt).toISOString(),
        ownerId: guild.ownerId,
        susuLink: guild.susuLink || undefined,
        roleId: guild.roleId,
        roleName: guild.roleName,
        roleColour: guild.roleColour,
        approved: true
    });
}