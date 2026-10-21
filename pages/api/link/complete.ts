import {NextApiRequest, NextApiResponse} from "next";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "../auth/[...nextauth]";
import prisma from "../../../prisma/client";
import {releaseNonce, tryConsumeNonce, verifyLinkToken} from "../../../lib/linkToken";

interface ResponseData {
    linked: boolean
    discordTag: string
    alreadyLinked?: boolean
}

interface ResponseError {
    error: boolean
    message: string
}

/**
 * Completes a bot-issued link.
 *
 * The token proves that the caller controls the Discord account (the bot signed
 * it after the user ran `/verify`). The session proves that the caller controls
 * the Southampton account. Neither proof has to cross an OAuth redirect, so the
 * browser that finishes the flow does not have to be the browser that started it.
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData | ResponseError>
) {
    if (req.method !== "POST") return res.status(405).json({
        error: true,
        message: 'Only HTTP verb POST is permitted',
    });

    const token = req.body?.t;
    const verification = verifyLinkToken(token);
    if (!verification.ok) {
        return res.status(verification.reason === "not-configured" ? 500 : 400).json({
            error: true,
            message: verification.message,
        });
    }

    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session?.sotonId) {
        return res.status(401).json({
            error: true,
            message: 'Sign in with your Southampton account before linking.',
        });
    }

    const {discordId, discordTag, nonce, exp} = verification.payload;

    const user = await prisma.user.findUnique({
        where: {
            sotonId: session.sotonId,
        }
    });

    if (!user) {
        return res.status(404).json({
            error: true,
            message: 'We could not find your Southampton account. Please sign in again.',
        });
    }

    // A user may safely re-open the same link (or click twice). Treat a link
    // that already points at the right Discord account as success.
    if (user.discordId === discordId && user.discordTag === discordTag) {
        return res.status(200).json({
            linked: true,
            discordTag,
            alreadyLinked: true,
        });
    }

    const existing = await prisma.user.findFirst({
        where: {
            OR: [
                {discordId},
                {discordTag},
            ],
        }
    });

    if (existing && existing.id !== user.id) {
        return res.status(409).json({
            error: true,
            message: 'That Discord account is already linked to another Southampton account. Run /verify in Discord to get a fresh link, or contact an admin if you think this is a mistake.',
        });
    }

    if (!tryConsumeNonce(nonce, exp)) {
        return res.status(409).json({
            error: true,
            message: 'This verification link has already been used. Run /verify in Discord to get a new one.',
        });
    }

    try {
        await prisma.user.update({
            data: {
                discordId,
                discordTag,
                discordLinkedDate: new Date(),
            },
            where: {
                id: user.id,
            }
        });
    } catch (e) {
        releaseNonce(nonce);
        console.error("Failed to link Discord account", e);
        return res.status(500).json({
            error: true,
            message: 'We could not save the link. Please try again, or run /verify in Discord for a fresh link.',
        });
    }

    console.info(`Linked Discord account ${discordId} to Southampton account ${session.sotonId}`);

    return res.status(200).json({
        linked: true,
        discordTag,
    });
}
