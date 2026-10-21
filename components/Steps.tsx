import React, {useState} from 'react';
import {Button, Code, Loader, Stepper, Text} from '@mantine/core';
import {LoginButton} from "@/components/LoginButton";
import {useSession} from "next-auth/react";

export const Steps: React.FC = () => {
    const {data: session, status} = useSession();
    const [refreshing, setRefreshing] = useState(false);

    if (status === 'loading') {
        return <Loader className="mt-10"/>;
    }

    const step = session?.microsoft.email ? 1 : 0;

    const refresh = () => {
        setRefreshing(true);
        // next-auth 4.10.3 has no useSession().update(); a full reload is the
        // reliable way to pick up a link completed in another browser.
        window.location.reload();
    };

    return (
        <Stepper active={step} breakpoint="sm" className="mt-6 w-full">
            <Stepper.Step label="Sign in with Southampton" description="Link your account" allowStepSelect={false}>
                <div className="flex w-full flex-col items-center justify-center px-2 text-center">
                    <LoginButton style={'microsoft'}/>
                </div>
            </Stepper.Step>
            <Stepper.Step label="Finish in Discord" description="Run /verify" allowStepSelect={false}>
                <div className="flex w-full max-w-xl flex-col items-center justify-center px-2 text-center">
                    <Text>
                        Open Discord and run <Code>/verify</Code> in the server you want to join.
                    </Text>
                    <Text className="pt-2">
                        The bot replies with a one-time link. Open it in this browser (or any
                        browser) and confirm. If you open it somewhere else, you&apos;ll be asked
                        to sign in with Southampton again.
                    </Text>
                    <div className="flex flex-wrap justify-center gap-2 pt-5">
                        <Button variant="outline" onClick={refresh} loading={refreshing}>
                            I&apos;ve finished linking
                        </Button>
                        <Button
                            component="a"
                            href="https://discord.com/app"
                            target="_blank"
                            rel="noreferrer"
                            variant="subtle"
                        >
                            Open Discord
                        </Button>
                    </div>
                </div>
            </Stepper.Step>
        </Stepper>
    );
}
