import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../prisma/client";
import { adminAuth } from "../../../../middleware/adminAuth";

interface UserResult {
    id: string
    discordId: string | null
    discordTag: string | null
    sotonId: string
    firstName: string
    lastName: string
    school: string
    sotonLinkedDate: string
    discordLinkedDate: string | null
}

interface ResponseError {
    error: boolean
    message: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<UserResult[] | ResponseError>
) {
    if (req.method !== "GET") return res.status(405).json({
        error: true,
        message: 'Only HTTP verb GET is permitted',
    });

    const check = await adminAuth(req, res);
    if (check) return;

    const search = typeof req.query.search === 'string' && req.query.search.trim()
        ? req.query.search.trim()
        : null;

    let users;
    if (search) {
        users = await prisma.user.findMany({
            where: {
                OR: [
                    { discordId: { contains: search } },
                    { discordTag: { contains: search, mode: 'insensitive' } },
                    { sotonId: { contains: search, mode: 'insensitive' } },
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            },
            take: 50,
            orderBy: { sotonLinkedDate: 'desc' },
        });
    } else {
        users = await prisma.user.findMany({
            take: 50,
            orderBy: { sotonLinkedDate: 'desc' },
        });
    }

    const results: UserResult[] = users.map(user => ({
        id: user.id,
        discordId: user.discordId,
        discordTag: user.discordTag,
        sotonId: user.sotonId,
        firstName: user.firstName,
        lastName: user.lastName,
        school: user.school,
        sotonLinkedDate: new Date(user.sotonLinkedDate).toISOString(),
        discordLinkedDate: user.discordLinkedDate ? new Date(user.discordLinkedDate).toISOString() : null,
    }));

    res.status(200).json(results);
}
