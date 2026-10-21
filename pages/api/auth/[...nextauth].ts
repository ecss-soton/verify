import NextAuth, {NextAuthOptions, unstable_getServerSession} from "next-auth"
import type {NextApiRequest, NextApiResponse} from "next";
import AzureADProvider from "next-auth/providers/azure-ad";
import DiscordProvider from "next-auth/providers/discord";
// import {PrismaAdapter} from "../../../prisma/adapter";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "../../../prisma/client";

/**
 * Links the Discord identity from a legacy Discord OAuth sign-in to the database
 * user that NextAuth resolved for this request.
 *
 * This is only a compatibility path: the normal link flow is the bot-issued
 * token handled by /link and /api/link/complete. The Discord callback is guarded
 * below so it can only ever run for a browser that is already signed in with
 * Southampton, which prevents NextAuth from creating a Discord-only user with a
 * null sotonId.
 */
async function linkDiscordAccount(
    user: { id?: string | null; discordId?: string | null; discordTag?: string | null },
    profile: { discordId?: string | null; id?: string | null; discordTag?: string | null } | null | undefined,
) {
    const discordId = profile?.discordId || profile?.id;
    const discordTag = profile?.discordTag;

    if (!user?.id || !discordId || !discordTag) {
        return;
    }

    if (user.discordId === discordId && user.discordTag === discordTag) {
        return;
    }

    const existing = await prisma.user.findFirst({
        where: {
            OR: [
                {discordId},
                {discordTag},
            ],
            NOT: {
                id: user.id,
            },
        },
        select: {
            id: true,
        },
    });

    if (existing) {
        console.warn(`Discord account ${discordId} is already linked to another user; not linking it to ${user.id}.`);
        return;
    }

    await prisma.user.update({
        data: {
            discordId,
            discordTag,
            discordLinkedDate: new Date(),
        },
        where: {
            id: user.id,
        },
    });
}

export const authOptions: NextAuthOptions  = {
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/auth-error',
  },
  events: {
    async signIn({ user, account, profile }) {
      // The bot-issued link flow writes the Discord fields directly. This event
      // only repairs the legacy "sign in with Discord" path, and only runs for a
      // user that already exists (the OAuth route is guarded below).
      if (account?.provider !== 'discord') {
        return;
      }

      await linkDiscordAccount(user, profile as any);
    },
  },
  providers: [
    DiscordProvider({
      clientId: String(process.env.DISCORD_CLIENT_ID),
      clientSecret: String(process.env.DISCORD_CLIENT_SECRET),
      // Only identify is needed now. The old flow also requested `guilds`, but
      // the guild list was never read by the API or the bot.
      authorization: "https://discord.com/api/oauth2/authorize?scope=identify",
      async profile(profile) {
        return {
          firstName: null,
          lastName: null,
          displayName: null,
          sotonId: null,
          school: null,

          id: profile.id,
          discordId: profile.id,
          discordTag: profile.username + '#' + profile.discriminator,

          guilds: [],
          accessLog: null,

          sotonLinkedDate: null,
          discordLinkedDate: null,
        };
      }
    }),
    AzureADProvider({
      clientId: String(process.env.AZURE_AD_CLIENT_ID),
      clientSecret: String(process.env.AZURE_AD_CLIENT_SECRET),
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: "openid profile User.Read email",
        },
      },
      async profile(profile, tokens) {

        const data = await fetch(
            `https://graph.microsoft.com/v1.0/me/`,
            {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
              },
            }
        )

        if (!data.ok) {
          throw new Error("We couldn't read your Microsoft profile. Please try again.");
        }

        const sotonData = await data.json();
        tokens.ext_expires_in = undefined;

        // `mail` is not always populated (for example for some guest accounts);
        // userPrincipalName is the reliable fallback. Both are `user@domain`.
        const email = String(sotonData.mail || sotonData.userPrincipalName || "").trim();
        const sotonId = email.split('@')[0];

        if (!sotonId) {
          throw new Error("We couldn't determine your Southampton username from your Microsoft account.");
        }

        // NOTE: the database convention stores the surname in `firstName` and the
        // given name in `lastName`; pages/api/v2/user/index.ts compensates for it.
        // Do not swap these without migrating existing rows first.
        return {
          id: sotonId,
          firstName: sotonData.surname || "",
          lastName: sotonData.givenName || "",
          displayName: sotonData.displayName || email,
          sotonId,
          school: sotonData.jobTitle || "",

          discordId: null,
          discordTag: null,

          guilds: [],
          accessLog: [],

          sotonLinkedDate: new Date(),
          discordLinkedDate: null,
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      session.firstName = user.firstName;
      session.lastName = user.lastName;
      session.sotonId = user.sotonId;
      session.discord = {
        id: user.discordId,
        tag: user.discordTag,
      };
      session.microsoft = {
        email: user.sotonId ? `${user.sotonId}@soton.ac.uk` : null,
        school: user.school,
      };
      return session
    }
  }
}

const nextAuthHandler = NextAuth(authOptions);

/**
 * Prevent the legacy Discord OAuth flow from creating a user on its own. It is
 * only allowed to link an account to an existing Southampton session, which is
 * exactly the "retry in this browser" action on /auth-error.
 */
export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const nextauth = req.query.nextauth;
  const isDiscordAuth = Array.isArray(nextauth)
      && nextauth.length >= 2
      && nextauth[1] === 'discord'
      && (nextauth[0] === 'signin' || nextauth[0] === 'callback');

  if (isDiscordAuth) {
    // Use a throw-away response object: we only want to read the session here,
    // and any refresh cookie it produces must not clash with the cookies the
    // real NextAuth handler is about to write.
    const cookieSink = {
      getHeader: () => undefined,
      setHeader: () => undefined,
    } as unknown as NextApiResponse;

    const session = await unstable_getServerSession(req, cookieSink, authOptions);
    if (!session?.sotonId) {
      res.redirect(302, '/auth-error?error=DiscordNotSignedIn');
      return;
    }
  }

  return nextAuthHandler(req, res);
}
