import "@/styles/globals.css";
import { AppProps } from "next/app";
import {SessionProvider} from "next-auth/react";
import {MantineProvider} from "@mantine/core";


export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
      <SessionProvider session={session}>
          <MantineProvider
              withGlobalStyles
              withNormalizeCSS
              theme={{
                  colorScheme: "light",
              }}
          >
            <Component {...pageProps} />
          </MantineProvider>
      </SessionProvider>
  );
}