import NextAuth from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad";
import DiscordProvider from "next-auth/providers/discord";
// import {PrismaAdapter} from "../../../prisma/adapter";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "../../../prisma/client";

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  events: {
    // async signIn(message) { /* on successful sign in */ },
    // async signOut(message) { /* on signout */ },
    // async createUser(message) { /* user created */ },
    // async updateUser(message) { /* user updated - e.g. their email was verified */ },
    async linkAccount({ user, account, profile}) {
      console.log("EVENT", { user, account, profile})

      const rest = await prisma.account.findFirst({
        where: {
          providerAccountId: profile.id,
        }
      })

      const mainUser = await prisma.user.update({
        data: {
          discordId: profile.id,
          discordTag: profile.discordTag,
        },
        where: {
          id: rest?.userId
        }
      })

      console.log(mainUser);
    },
    // async session(message) { /* session is active */ },
  },
  providers: [
    DiscordProvider({
      clientId: String(process.env.DISCORD_CLIENT_ID),
      clientSecret: String(process.env.DISCORD_CLIENT_SECRET),
      authorization: "https://discord.com/api/oauth2/authorize?scope=" + ["identify", "guilds"].join("+"),
      async profile(profile, tokens) {

        console.log({ profile, tokens })

        return {
          id: profile.id,
          discordTag: profile.username + '#' + profile.discriminator,
          discordId: profile.id,
          // icon: profile.avatar,
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

        console.log({ sotonData, profile, tokens })

        return {
          id: sotonData.mail.split('@')[0],
          firstName: sotonData.surname,
          lastName: sotonData.givenName,
          displayName: sotonData.displayName,
          sotonId: sotonData.mail.split('@')[0],
          school: sotonData.jobTitle,
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
      console.log({ session, token, user });
      return session
    }
  }
})