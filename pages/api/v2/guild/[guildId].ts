import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../prisma/client";
import {auth} from "../../../../middleware/auth";

interface ResponseData {
    id: string
    name: string
    icon?: string
    ownerId: string
    susuLink?: string
    inviteLink: string
    roleId: string
    roleName: string
    roleColour: number
    createdAt: string
    updatedAt: string
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
    if (req.method !== "GET") return res.status(405).json({
        error: true,
        message: 'Only HTTP verb GET is permitted',
    });
    const check = auth(req, res);
    if (check) return res;

    const guildId = typeof req.query.guildId === 'string' ? req.query.guildId : req?.query?.guildId?.[0]

    if (!guildId) {
        return res.status(400).json({
            error: true,
            message: 'Incorrectly formatted guildId parameter',
        })
    }

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
        icon: guild.icon || undefined,
        ownerId: guild.ownerId,
        susuLink: guild.susuLink || undefined,
        inviteLink: guild.inviteLink,
        roleId: guild.roleId,
        roleName: guild.roleName,
        roleColour: guild.roleColour,
        createdAt: new Date(guild.createdAt).toISOString(),
        updatedAt: new Date(guild.updatedAt).toISOString(),
        approved: true
    });
}
