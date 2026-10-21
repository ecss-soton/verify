import {Html, Head, Main, NextScript} from "next/document";

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <meta
                    name="description"
                    content="Soton Verify links your University of Southampton account to Discord so servers can verify you once."
                />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
                <link rel="manifest" href="/site.webmanifest"/>
                <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#005C85"/>
                <meta name="msapplication-TileColor" content="#005C85"/>
                <meta name="theme-color" content="#005C85"/>
            </Head>
            <body>
                <Main/>
                <NextScript/>
            </body>
        </Html>
    );
}
