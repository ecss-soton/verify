import Link from "next/link";
import {useRouter} from "next/router";
import React from "react";
import {Alert, Button, Loader, Text, Title} from "@mantine/core";
import {signIn, useSession} from "next-auth/react";
import {PageLayout} from "@/components/PageLayout";
import {BrandTitle} from "@/components/BrandTitle";

interface ErrorCopy {
    title: string
    body: string
}

const errorCopy: Record<string, ErrorCopy> = {
    OAuthCallback: {
        title: "We couldn't finish signing you in",
        body: "This usually happens when sign-in was started in a different browser or app. Try again in this browser. If you were linking Discord, running /verify in Discord will give you a fresh link that works in any browser.",
    },
    OAuthSignin: {
        title: "We couldn't start the sign-in",
        body: "The sign-in provider did not respond correctly. Try again in this browser.",
    },
    OAuthCreateAccount: {
        title: "We couldn't create your account",
        body: "Your Southampton account details could not be saved. Please try again, and contact the ECSS web officer if it keeps happening.",
    },
    OAuthAccountNotLinked: {
        title: "That account is already linked",
        body: "That Discord account is already connected to a different Southampton account. Run /verify from the Discord account you want to use, or contact an admin if you think this is a mistake.",
    },
    AccessDenied: {
        title: "Sign-in was denied",
        body: "You do not have permission to sign in with that account. Make sure you are using your University of Southampton account.",
    },
    Configuration: {
        title: "The service is misconfigured",
        body: "Sign-in is not configured correctly on the server. Please contact the ECSS web officer.",
    },
    DiscordNotSignedIn: {
        title: "Sign in with Southampton first",
        body: "Discord linking is started from the verification link the bot sends. Run /verify in Discord, or sign in with Southampton below and then use the link the bot gives you.",
    },
    Callback: {
        title: "Something went wrong while finishing sign-in",
        body: "The sign-in provider returned an unexpected response. Try again in this browser; if it keeps happening, contact the ECSS web officer.",
    },
    Default: {
        title: "We couldn't finish signing you in",
        body: "Try again in this browser. If the problem continues, go back to Discord and run /verify for a fresh verification link.",
    },
};

export default function AuthError() {
    const router = useRouter();
    const {data: session, status} = useSession();

    const errorCode = typeof router.query.error === "string" ? router.query.error : "Default";
    const copy = errorCopy[errorCode] || errorCopy.Default;

    const signedIn = !!session?.sotonId;
    const hasDiscord = !!session?.discord?.tag;
    const canRetryDiscord = signedIn && !hasDiscord && [
        "OAuthCallback",
        "OAuthSignin",
        "DiscordNotSignedIn",
        "Callback",
    ].includes(errorCode);

    let actions: React.ReactNode;
    if (status === "loading") {
        actions = <Loader className="mt-8"/>;
    } else if (!signedIn) {
        actions = (
            <div className="flex flex-col items-center gap-3 pt-8">
                <Button
                    size="md"
                    onClick={() => signIn("azure-ad", {callbackUrl: "/"})}
                >
                    Sign in with Southampton in this browser
                </Button>
                <Button component={Link} href="/" variant="outline">Back to home</Button>
            </div>
        );
    } else if (hasDiscord) {
        actions = (
            <div className="flex flex-col items-center gap-3 pt-8">
                <Alert color="green" className="w-full" role="status">
                    Your account is linked as <strong>{session.discord.tag}</strong>.
                </Alert>
                <Button component={Link} href="/">Go to your account</Button>
            </div>
        );
    } else {
        actions = (
            <div className="flex flex-col items-center gap-3 pt-8">
                {canRetryDiscord ? (
                    <Button
                        size="md"
                        onClick={() => signIn("discord", {callbackUrl: "/?link=1"})}
                    >
                        Retry linking Discord in this browser
                    </Button>
                ) : null}

                <Alert color="blue" className="w-full">
                    <Text weight={500}>Recommended: use a fresh link from the bot</Text>
                    <Text>
                        Open Discord, run <code>/verify</code> in the server you want to join,
                        and open the link the bot sends you. That link carries your Discord
                        account with it, so it works in any browser.
                    </Text>
                    <Button
                        component="a"
                        href="https://discord.com/app"
                        target="_blank"
                        rel="noreferrer"
                        variant="subtle"
                        size="xs"
                        className="mt-2"
                    >
                        Open Discord
                    </Button>
                </Alert>

                <Button component={Link} href="/" variant="outline">Back to home</Button>
            </div>
        );
    }

    return (
        <PageLayout title="Sign-in problem - Soton Verify" mainClassName="max-w-xl">
            <BrandTitle compact/>
            <div className="w-full max-w-xl">
                <Title order={2} className="mb-4">{copy.title}</Title>
                <Text>{copy.body}</Text>
                <div aria-live="polite">{actions}</div>

                {errorCode !== "Default" ? (
                    <details className="pt-6 text-left">
                        <summary className="cursor-pointer text-xs text-gray-500">
                            Technical details
                        </summary>
                        <Text size="xs" color="dimmed" className="pt-2">
                            Error code: <code>{errorCode}</code>
                        </Text>
                    </details>
                ) : null}
            </div>
        </PageLayout>
    );
}
