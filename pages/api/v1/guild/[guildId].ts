import { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
    id: string
    name: string
    icon: string
    createdAt: string
    ownerId: string
    susuLink: string
    roleId: string
    roleName: string
    roleColour: string
    approved: boolean
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== "GET") return res.status(405);
}