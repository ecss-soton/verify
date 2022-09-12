import { useSession, signIn, signOut } from "next-auth/react"
import React from "react";
import { Button } from '@mantine/core';
import {LoginButton} from "@/components/LoginButton";
import Link from "next/link";

export const MangeLink: React.FC = () => {

    const { data: session } = useSession();


    return (
        <>
            <div className="pt-14">
                <LoginButton style={'discord'} />
                <LoginButton style={'microsoft'} />
                <div className="flex flex-row pt-6">
                    <div className="pr-1">
                        <Link href="/manage" passHref>
                            <Button className="" variant="filled">Manage verification</Button>
                        </Link>
                    </div>
                    <div className="pl-1">
                        <Link href="/audit" passHref>
                            <Button variant="outline">View audit log</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}