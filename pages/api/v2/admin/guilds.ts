import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../prisma/client";
import { adminAuth } from "../../../../middleware/adminAuth";

interface GuildResult {
    id: string
    name: string
    icon: string | null
    ownerId: string
    inviteLink: string
    roleName: string
    roleId: string
    createdAt: string
    approved: boolean
}

interface ResponseError {
    error: boolean
    message: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<GuildResult[] | ResponseError>
) {
    if (req.method !== "GET") return res.status(405).json({
        error: true,
        message: 'Only HTTP verb GET is permitted',
    });

    const check = await adminAuth(req, res);
    if (check) return;

    const pendingOnly = req.query.status === 'pending';

    const guilds = await prisma.guild.findMany({
        where: pendingOnly ? {approved: false} : undefined,
        orderBy: {
            createdAt: 'asc',
        },
        take: 100,
        select: {
            id: true,
            name: true,
            icon: true,
            ownerId: true,
            inviteLink: true,
            roleName: true,
            roleId: true,
            createdAt: true,
            approved: true,
        },
    });

    const results: GuildResult[] = guilds.map(guild => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        ownerId: guild.ownerId,
        inviteLink: guild.inviteLink,
        roleName: guild.roleName,
        roleId: guild.roleId,
        createdAt: guild.createdAt.toISOString(),
        approved: guild.approved,
    }));

    res.status(200).json(results);
}
