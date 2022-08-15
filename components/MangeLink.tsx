import { useSession, signIn, signOut } from "next-auth/react"
import React from "react";
import { Button } from '@mantine/core';
import {LoginButton} from "@/components/LoginButton";

export const MangeLink: React.FC = () => {

    const { data: session } = useSession();

    console.log({ session })


    return (
        <>
            <div className="pt-14">
                <LoginButton style={'discord'} />
                <LoginButton style={'microsoft'} />
                <div className="flex flex-row">
                    <Button variant="filled">Manage verification</Button>
                    <Button variant="outline">View audit log</Button>
                </div>
            </div>
        </>
    )
}