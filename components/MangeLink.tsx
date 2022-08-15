import { useSession, signIn, signOut } from "next-auth/react"
import React from "react";
import { Button } from '@mantine/core';
import {LoginButton} from "@/components/LoginButton";

export const MangeLink: React.FC = () => {

    const { data: session } = useSession();

    console.log({ session })


    return (
        <>
            <LoginButton style={'discord'} />
            <LoginButton style={'microsoft'} />
            <Button className="" >Test</Button>
        </>
    )
}