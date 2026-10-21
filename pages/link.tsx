import Link from "next/link";
import {useRouter} from "next/router";
import React, {useState} from "react";
import {Alert, Button, Loader, Text, Title} from "@mantine/core";
import {signIn, signOut} from "next-auth/react";
import {unstable_getServerSession} from "next-auth";
import type {GetServerSideProps} from "next";
import {authOptions} from "pages/api/auth/[...nextauth]";
import prisma from "../prisma/client";
import {verifyLinkToken} from "@/lib/linkToken";
import {PageLayout} from "@/components/PageLayout";
import {BrandTitle} from "@/components/BrandTitle";

type LinkStatus = "needs-signin" | "ready" | "invalid";

interface LinkPageProps {
    status: LinkStatus
    token: string | null
    discordId: string | null
    discordTag: string | null
    guildName: string | null
    currentDiscordId: string | null
    currentDiscordTag: string | null
    signedInEmail: string | null
    error: string | null
}

export default function LinkPage({
    status,
    token,
    discordId,
    discordTag,
    guildName,
    currentDiscordId,
    currentDiscordTag,
    signedInEmail,
    error,
}: LinkPageProps) {
    const router = useRouter();
    const [state, setState] = useState<"idle" | "linking" | "done" | "error">("idle");
    const [message, setMessage] = useState<string | null>(error);

    const alreadyLinked = !!(discordId && currentDiscordId === discordId && discordTag === currentDiscordTag);
    const usernameChanged = !!(discordId && currentDiscordId === discordId && discordTag && currentDiscordTag !== discordTag);

    const finishLink = async () => {
        if (!token) return;

        setState("linking");
        setMessage(null);

        try {
            const response = await fetch("/api/link/complete", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({t: token}),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "We could not finish linking your account.");
            }

            setState("done");
            // Do a full navigation so the SessionProvider fetches the freshly
            // updated user instead of reusing its cached, unlinked session.
            setTimeout(() => window.location.assign("/?link=1"), 700);
        } catch (e) {
            setState("error");
            setMessage(e instanceof Error ? e.message : "We could not finish linking your account.");
        }
    };

    let content: React.ReactNode;
    if (status === "invalid") {
        content = (
            <div className="flex w-full flex-col items-center text-center">
                <Alert color="red" title="This link cannot be used" className="w-full" role="alert">
                    {error || "This verification link is not valid."}
                </Alert>
                <Text className="pt-5">
                    Open Discord and run <code>/verify</code> in the server you want to join.
                    The bot will send you a fresh link.
                </Text>
                <div className="flex flex-row gap-3 pt-6">
                    <Button component={Link} href="/" variant="outline">Back to home</Button>
                </div>
            </div>
        );
    } else if (status === "needs-signin") {
        content = (
            <div className="flex w-full flex-col items-center text-center">
                <Text size="lg">
                    You are about to link the Discord account <strong>{discordTag}</strong>
                    {guildName ? <> from <strong>{guildName}</strong></> : null} to your
                    Southampton account.
                </Text>
                <Text className="pt-4">
                    Sign in with Southampton below to confirm. Signing in and linking both
                    happen in this browser, so you do not need to return to the browser you
                    started in.
                </Text>
                <div className="pt-6">
                    <Button
                        size="md"
                        onClick={() => signIn("azure-ad", {callbackUrl: router.asPath})}
                    >
                        Sign in with Southampton
                    </Button>
                </div>
                <Text size="xs" color="dimmed" className="pt-6">
                    Not your Discord account? Close this page, open Discord and run
                    <code> /verify</code> again.
                </Text>
            </div>
        );
    } else if (alreadyLinked) {
        content = (
            <div className="flex w-full flex-col items-center text-center">
                <Alert color="green" title="Already linked" className="w-full" role="status">
                    {discordTag} is already linked to your Southampton account.
                </Alert>
                <div className="pt-6">
                    <Button component={Link} href="/">Go to your account</Button>
                </div>
            </div>
        );
    } else {
        content = (
            <div className="flex w-full flex-col items-center text-center">
                <Text size="lg">
                    Link the Discord account <strong>{discordTag}</strong>
                    {guildName ? <> from <strong>{guildName}</strong></> : null} to your
                    Southampton account?
                </Text>

                {signedInEmail ? (
                    <div className="flex flex-col items-center gap-1 pt-3">
                        <Text size="xs" color="dimmed">Signed in as {signedInEmail}</Text>
                        <Button
                            variant="subtle"
                            size="xs"
                            onClick={() => signOut({callbackUrl: router.asPath})}
                        >
                            Use a different account
                        </Button>
                    </div>
                ) : null}

                {usernameChanged ? (
                    <Alert color="blue" title="Your Discord username will be updated" className="mt-5 w-full" role="status">
                        Your account is already linked to this Discord account, but the saved
                        username is <strong>{currentDiscordTag}</strong>. Confirming will update
                        it to <strong>{discordTag}</strong>.
                    </Alert>
                ) : null}

                {currentDiscordTag && currentDiscordId !== discordId ? (
                    <Alert color="yellow" title="This will replace your current link" className="mt-5 w-full" role="status">
                        Your account is currently linked to <strong>{currentDiscordTag}</strong>.
                        Confirming will replace it with <strong>{discordTag}</strong>.
                    </Alert>
                ) : null}

                {message ? (
                    <Alert color="red" title="Could not link" className="mt-5 w-full" role="alert">
                        {message}
                    </Alert>
                ) : null}

                <div className="pt-6">
                    {state === "done" ? (
                        <Alert color="green" title="Linked!" className="w-full" role="status">
                            Your accounts are linked. Taking you back to the home page...
                        </Alert>
                    ) : (
                        <Button
                            size="md"
                            onClick={finishLink}
                            disabled={state === "linking"}
                            leftIcon={state === "linking" ? <Loader size="xs" color="white"/> : undefined}
                        >
                            {state === "linking" ? "Linking..." : "Link this Discord account"}
                        </Button>
                    )}
                </div>

                <Text size="xs" color="dimmed" className="pt-6">
                    Not your Discord account? Close this page, open Discord and run
                    <code> /verify</code> again.
                </Text>
            </div>
        );
    }

    return (
        <PageLayout title="Link your Discord account - Soton Verify" mainClassName="max-w-xl">
            <BrandTitle compact/>
            <Title order={2} className="mb-6">Finish linking your account</Title>
            {content}
        </PageLayout>
    );
}

export const getServerSideProps: GetServerSideProps<LinkPageProps> = async (context) => {
    const rawToken = context.query.t;
    const token = typeof rawToken === "string" ? rawToken : Array.isArray(rawToken) ? rawToken[0] : null;

    const verification = verifyLinkToken(token);
    if (!verification.ok) {
        return {
            props: {
                status: "invalid",
                token: null,
                discordId: null,
                discordTag: null,
                guildName: null,
                currentDiscordId: null,
                currentDiscordTag: null,
                signedInEmail: null,
                error: verification.message,
            },
        };
    }

    const {discordId, discordTag, guildId} = verification.payload;

    const guild = await prisma.guild.findUnique({
        where: {id: guildId},
        select: {name: true},
    });

    const session = await unstable_getServerSession(context.req, context.res, authOptions);

    if (!session?.sotonId) {
        return {
            props: {
                status: "needs-signin",
                token,
                discordId,
                discordTag,
                guildName: guild?.name || null,
                currentDiscordId: null,
                currentDiscordTag: null,
                signedInEmail: null,
                error: null,
            },
        };
    }

    const user = await prisma.user.findUnique({
        where: {sotonId: session.sotonId},
        select: {
            discordId: true,
            discordTag: true,
        },
    });

    // Give a clear answer before asking the user to confirm if this Discord
    // account already belongs to someone else.
    const otherOwner = await prisma.user.findFirst({
        where: {
            OR: [
                {discordId},
                {discordTag},
            ],
            NOT: {
                sotonId: session.sotonId,
            },
        },
        select: {
            sotonId: true,
        },
    });

    if (otherOwner) {
        return {
            props: {
                status: "invalid",
                token: null,
                discordId: null,
                discordTag: null,
                guildName: guild?.name || null,
                currentDiscordId: user?.discordId || null,
                currentDiscordTag: user?.discordTag || null,
                signedInEmail: session.microsoft.email || null,
                error: `The Discord account ${discordTag} is already linked to another Southampton account. Run /verify in Discord to get a fresh link, or contact an admin if you think this is a mistake.`,
            },
        };
    }

    return {
        props: {
            status: "ready",
            token,
            discordId,
            discordTag,
            guildName: guild?.name || null,
            currentDiscordId: user?.discordId || null,
            currentDiscordTag: user?.discordTag || null,
            signedInEmail: session.microsoft.email || null,
            error: null,
        },
    };
};
