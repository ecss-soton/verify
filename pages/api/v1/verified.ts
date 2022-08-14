import { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
    verified: boolean
    roleId: string
    sotonLinkedDate: string
    discordLinkedDate: string
}

type ResponseError = {
    error: boolean
    message: string
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData | ResponseError>
) {
    if (req.method !== "GET") return res.status(405);
}