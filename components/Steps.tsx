import React from 'react';
import {Button, Stepper } from '@mantine/core';
import {LoginButton} from "@/components/LoginButton";
import {useSession} from "next-auth/react";

export const Steps: React.FC = () => {
    let step = 0;

    const { data: session } = useSession();
    if (session?.microsoft.email) {
        step = 1;
    }
    if (session?.discord.tag) {
        step = 2;
    }

    return (
        <>
            <Stepper active={step} breakpoint="sm" className="mt-10 max-w-xs md:max-w-5xl">
                <Stepper.Step label="Sign in with Southampton" description="Link your account" allowStepSelect={false}>
                    <div className="flex flex-col items-center justify-center w-full flex-1 px-40 text-center">
                        <LoginButton style={'microsoft'}/>
                    </div>
                </Stepper.Step>
                <Stepper.Step label="Sign in with Discord" description="Link your account" allowStepSelect={false}>
                    <div className="flex flex-col items-center justify-center w-full flex-1 px-40 text-center">
                        <LoginButton style={'discord'}/>
                    </div>
                </Stepper.Step>
                <Stepper.Completed>
                    Congratulations! You have just linked your Southampton uni account and discord account!
                </Stepper.Completed>
            </Stepper>
        </>
    );
}