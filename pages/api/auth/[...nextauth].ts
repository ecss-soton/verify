import NextAuth, {NextAuthOptions} from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad";
import DiscordProvider from "next-auth/providers/discord";
// import {PrismaAdapter} from "../../../prisma/adapter";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "../../../prisma/client";

export const authOptions: NextAuthOptions  = {
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: '/',
    signOut: '/',
  },
  events: {
    // async signIn(message) { /* on successful sign in */ },
    // async signOut(message) { /* on signout */ },
    async createUser({ user }) {
      // Should only ever be microsoft accounts being created here

      // console.log(user)

    },
    // async updateUser(message) { /* user updated - e.g. their email was verified */ },
    async linkAccount({ user, account, profile}) {

      // console.log({ user, account, profile })

      if (account.provider != 'discord') {
        return;
      }

      const userAccount = await prisma.account.findUnique({
        where: {
          providerAccountId: profile.id,
        }
      })

      const mainUser = await prisma.user.update({
        data: {
          discordId: profile.id,
          discordTag: profile.discordTag,
          discordLinkedDate: new Date(),
          guilds: profile.guilds || []
        },
        where: {
          id: userAccount?.userId
        }
      })
    },
    // async session(message) { /* session is active */ },
  },
  providers: [
    DiscordProvider({
      clientId: String(process.env.DISCORD_CLIENT_ID),
      clientSecret: String(process.env.DISCORD_CLIENT_SECRET),
      authorization: "https://discord.com/api/oauth2/authorize?scope=" + ["identify", "guilds"].join("+"),
      async profile(profile, tokens) {
        const data = await fetch(
            `https://discord.com/api/v10/users/@me/guilds`,
            {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
              },
            }
        )

        const allGuilds = await data.json()

        const sotonGuilds = (await prisma.guild.findMany({
          select: {
            id: true,
          }
        })).map(i => i.id)

        const sotonVerifyGuilds = allGuilds.filter((i: any) => !!sotonGuilds.includes(i.id))

        return {
          firstName: null,
          lastName: null,
          displayName: null,
          sotonId: null,
          school: null,

          id: profile.id,
          discordId: profile.id,
          discordTag: profile.username + '#' + profile.discriminator,

          guilds: sotonVerifyGuilds,
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

        const sotonData = await data.json();
        tokens.ext_expires_in = undefined;

        return {
          id: sotonData.mail.split('@')[0],
          firstName: sotonData.surname,
          lastName: sotonData.givenName,
          displayName: sotonData.displayName,
          sotonId: sotonData.mail.split('@')[0],
          school: sotonData.jobTitle,

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
      session.discord = {
        tag: user.discordTag,
      };
      session.microsoft = {
        email: user.sotonId + '@soton.ac.uk',
        school: user.school,
      };
      return session
    }
  }
}

export default NextAuth(authOptions)