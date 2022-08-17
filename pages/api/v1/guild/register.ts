import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../prisma/client";
import {auth} from "../../../../middleware/auth";
import { randomUUID } from 'crypto'

interface ResponseData {
    registered: boolean
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
    if (req.method !== "POST") return res.status(405);
    const check = auth(req, res);
    if (check) return res;


    const checkGuild = await prisma.guild.findUnique({
        where: {
            id: req.body.guildId,
        }
    })

    if (checkGuild?.approved == true) {
        return res.status(409).json({
            error: true,
            message: 'This guild already exists and cannot be modified as it is an approved guild',
        })
    }

    if (!checkGuild && (!req.body.name || !req.body.ownerId || !req.body.roleId || isNaN(Number(req.body.roleColour)) || !req.body.roleName || !req.body.inviteLink)) {
       return res.status(400).json({
           error: true,
           message: 'You are missing one of the body params. See https://github.com/ecss-soton/verify#update-the-verified-role-for-a-guild',
       })
    }

    const guild = await prisma.guild.upsert({
        create: {
            id: req.body.guildId,
            name: req.body.name,
            icon: req.body.icon || null,
            createdAt: new Date(),
            ownerId: req.body.ownerId,
            susuLink: req.body.susuLink || null,
            roleId: req.body.roleId,
            roleName: req.body.roleName,
            roleColour: req.body.roleColour,
            inviteLink: req.body.inviteLink,
            memberCount: 0,
            approved: false,
            apiKey: randomUUID(),
        },
        update: {
            name: req.body.name,
            icon: req.body.icon,
            ownerId: req.body.ownerId,
            susuLink: req.body.susuLink,
            roleId: req.body.roleId,
            roleName: req.body.roleName,
            roleColour: req.body.roleColour,
            inviteLink: req.body.inviteLink,
        },
        where: {
            id: req.body.guildId,
        }
    })

    res.status(200).json({
        registered: true,
        approved: guild.approved
    });
}