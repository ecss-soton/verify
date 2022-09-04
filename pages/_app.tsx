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
                  colors: {
                      brand: ['#dbf9ff', '#afe8ff', '#80d8ff', '#51c8fe', '#2cb8fc', '#1c9fe3', '#0d7bb2', '#005880', '#00354f','#00131f' ],
                  },
                  primaryColor: 'brand',
              }}
          >
            <Component {...pageProps} />
          </MantineProvider>
      </SessionProvider>
  );
}