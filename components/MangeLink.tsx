import { useSession, signIn, signOut } from "next-auth/react"
import React from "react";
import { Button } from '@mantine/core';
import {LoginButton} from "@/components/LoginButton";
import {useRouter} from "next/router";

export const MangeLink: React.FC = () => {

    const { data: session } = useSession();

    const router = useRouter()

    return (
        <>
            <div className="pt-14">
                <LoginButton style={'discord'} />
                <LoginButton style={'microsoft'} />
                <div className="flex flex-row pt-6">
                    <div className="pr-1">
                        <Button onClick={() => router.push('/manage')} className="" variant="filled">Manage verification</Button>
                    </div>
                    <div className="pl-1">
                        <Button onClick={() => router.push('/audit')}  variant="outline">View audit log</Button>
                    </div>
                </div>
            </div>
        </>
    )
}