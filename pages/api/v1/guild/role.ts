import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../prisma/client";
import {auth} from "../../../../middleware/auth";

interface ResponseData {
    success: boolean
}

interface ResponseError {
    error: boolean
    message: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData | ResponseError>
) {
    if (req.method !== "PATCH") return res.status(405);
    const check = auth(req, res);
    if (check) return res;

    try {
        const guild = await prisma.guild.update({
            data: {
                roleId: req.body.roleId,
                roleColour: Number(req.body.roleColour),
                roleName: req.body.roleName,
            },
            where: {
                id: req.body.guildId,
            }
        })

        res.status(200).json({
            success: guild.roleId == req.body.roleId
        });
    } catch (e) {
        return res.status(404).json({
            error: true,
            message: 'This guild does not exist',
        })
    }
}