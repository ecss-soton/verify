import Link from "next/link";
import React from "react";
import {Button, Text} from "@mantine/core";
import {LoginButton} from "@/components/LoginButton";

export const ManageLink: React.FC = () => {
    return (
        <div className="w-full max-w-md pt-8">
            <h2 className="mb-2 text-2xl font-semibold">Your accounts are linked</h2>
            <Text color="dimmed" size="sm" className="mb-4">
                Your Southampton account and Discord account are connected.
            </Text>
            <LoginButton style={'discord'}/>
            <LoginButton style={'microsoft'}/>
            <div className="flex flex-wrap justify-center gap-2 pt-6">
                <Button component={Link} href="/manage">Manage verification</Button>
                <Button component={Link} href="/audit" variant="outline">View audit log</Button>
            </div>
        </div>
    );
}
