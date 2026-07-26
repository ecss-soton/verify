import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";

interface ResponseError {
    error: boolean
    message: string
}

export async function adminAuth(
    req: NextApiRequest,
    res: NextApiResponse<ResponseError>
): Promise<boolean> {
    const session = await unstable_getServerSession(req, res, authOptions);

    if (!session?.discord?.id) {
        res.status(401).json({
            error: true,
            message: 'You must be authenticated to access this endpoint',
        });
        return true;
    }

    const adminIds = (process.env.ADMIN_DISCORD_IDS || '').split(',').map(id => id.trim()).filter(Boolean);

    if (!adminIds.includes(session.discord.id)) {
        res.status(403).json({
            error: true,
            message: 'You must be an admin to access this endpoint',
        });
        return true;
    }

    return false;
}
