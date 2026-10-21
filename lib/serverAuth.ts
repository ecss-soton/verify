import type {GetServerSidePropsContext} from "next";
import {unstable_getServerSession, type Session} from "next-auth";
import {authOptions} from "pages/api/auth/[...nextauth]";
import prisma from "../prisma/client";
import type {User} from "@prisma/client";

interface LinkedUser {
    session: Session;
    user: User;
}

/**
 * Resolves the session to the linked Southampton user, or returns null when the
 * visitor is not signed in / has not linked Discord yet.
 */
export async function getLinkedUser(context: GetServerSidePropsContext): Promise<LinkedUser | null> {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);

    if (!session?.discord?.tag) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: {
            discordTag: session.discord.tag,
        },
    });

    if (!user) {
        return null;
    }

    return {session, user};
}

/**
 * Returns the session only when the signed-in Discord account is in
 * ADMIN_DISCORD_IDS.
 */
export async function getAdminSession(context: GetServerSidePropsContext): Promise<Session | null> {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);

    if (!session?.discord?.id) {
        return null;
    }

    const adminIds = (process.env.ADMIN_DISCORD_IDS || '')
        .split(',')
        .map(id => id.trim())
        .filter(Boolean);

    return adminIds.includes(session.discord.id) ? session : null;
}
