import NextAuth from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad";
import DiscordProvider from "next-auth/providers/discord";

export default NextAuth({
  providers: [
    DiscordProvider({
      clientId: String(process.env.DISCORD_CLIENT_ID),
      clientSecret: String(process.env.DISCORD_CLIENT_SECRET)
    }),
    AzureADProvider({
      clientId: String(process.env.AZURE_AD_CLIENT_ID),
      clientSecret: String(process.env.AZURE_AD_CLIENT_SECRET),
      tenantId: process.env.AZURE_AD_TENANT_ID,
      // authorization:'',
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

        const t = await data.json();

        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          job: t.jobTitle,
          givenName: t.givenName,
          surname: t.surname,
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      // Persist the OAuth access_token to the token right after signin
      // console.log('TOKEN', token, account, profile, user)
      if (account) {
        token.accessToken = account.access_token
      }
      if (user) {
        token.job = user.job
        token.givenName = user.givenName
        token.surname = user.surname
      }

      return token
    },
    async session({ session, token, user }) {
      // console.log('SESSION', session, token, user)
      // Send properties to the client, like an access_token from a provider.
      // session.user.job = token?.job
      // session.user.givenName = token?.givenName
      // session.user.surname = token?.surname
      return session
    }
  }
})