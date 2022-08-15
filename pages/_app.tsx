import "@/styles/globals.css";
import { AppProps } from "next/app";
import {SessionProvider} from "next-auth/react";
import {createEmotionCache, MantineProvider} from "@mantine/core";

const myCache = createEmotionCache({ key: 'mantine', prepend: false });

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
      <SessionProvider session={session}>
          <MantineProvider
              withGlobalStyles
              withNormalizeCSS
              emotionCache={myCache}
              theme={{
                  colorScheme: "light",
              }}
          >
            <Component {...pageProps} />
          </MantineProvider>
      </SessionProvider>
  );
}