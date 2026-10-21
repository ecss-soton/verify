import Link from "next/link";
import {useState} from "react";
import type {GetServerSideProps} from "next";
import {Alert, Avatar, Button, Popover, Text} from '@mantine/core';
import {faChainBroken, faDownload, faTrashCan} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import {PageLayout} from "@/components/PageLayout";
import {getLinkedUser} from "@/lib/serverAuth";
import prisma from "../prisma/client";

interface ManageGuild {
    id: string
    name: string
    icon: string | null
}

interface ManageProps {
    guilds: ManageGuild[]
}

type BusyAction = 'unlink' | 'delete' | null;

async function readError(response: Response): Promise<string> {
    const body = await response.json().catch(() => ({}));
    return body?.message || `Request failed (${response.status}).`;
}

export default function Manage({guilds}: ManageProps) {
    const [busy, setBusy] = useState<BusyAction>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const unlinkData = async () => {
        setBusy('unlink');
        setActionError(null);

        try {
            const response = await fetch("/api/v2/user/data", {
                method: "PATCH",
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(await readError(response));
            }

            window.location.reload();
        } catch (e) {
            setActionError(e instanceof Error ? e.message : "Could not unlink your Discord account.");
            setBusy(null);
        }
    }

    const deleteData = async () => {
        setBusy('delete');
        setActionError(null);

        try {
            const response = await fetch("/api/v2/user/data", {
                method: "DELETE",
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(await readError(response));
            }

            // Full navigation so the client drops the now-deleted session.
            window.location.assign('/');
        } catch (e) {
            setActionError(e instanceof Error ? e.message : "Could not delete your account.");
            setBusy(null);
        }
    }

    return (
        <PageLayout title="Manage verification - Soton Verify" mainClassName="max-w-3xl">
            <h1 className="m-5 text-3xl font-bold text-[#005C85] sm:text-4xl md:text-5xl">
                Manage verification
            </h1>
            <p className="max-w-2xl text-left">
                View the servers that use Soton Verify and get a copy of the data we hold
                about you.
            </p>

            {actionError ? (
                <Alert
                    color="red"
                    title="Something went wrong"
                    className="mt-4 w-full max-w-2xl"
                    role="alert"
                    onClose={() => setActionError(null)}
                    withCloseButton
                >
                    {actionError}
                </Alert>
            ) : null}

            <div className="flex flex-wrap justify-center gap-2 py-6">
                <Button component={Link} href="/" variant="default">Back</Button>

                <Button
                    component="a"
                    href="/api/v2/user/data"
                    download
                    variant="outline"
                    leftIcon={<FontAwesomeIcon icon={faDownload} aria-hidden="true"/>}
                >
                    Get a copy of your data
                </Button>

                <Popover position="top" withArrow shadow="md" width={320}>
                    <Popover.Target>
                        <Button
                            leftIcon={<FontAwesomeIcon icon={faChainBroken} aria-hidden="true"/>}
                            color="orange"
                            disabled={busy !== null}
                        >
                            Unlink Discord
                        </Button>
                    </Popover.Target>
                    <Popover.Dropdown>
                        <Text>This disconnects your Discord account from your Southampton account.</Text>
                        <Text className="pb-3">You can re-link it at any time by running /verify in Discord.</Text>
                        <Button
                            onClick={unlinkData}
                            leftIcon={<FontAwesomeIcon icon={faChainBroken} aria-hidden="true"/>}
                            color="orange"
                            loading={busy === 'unlink'}
                            disabled={busy !== null}
                        >
                            Confirm unlink
                        </Button>
                    </Popover.Dropdown>
                </Popover>

                <Popover position="top" withArrow shadow="md" width={320}>
                    <Popover.Target>
                        <Button
                            leftIcon={<FontAwesomeIcon icon={faTrashCan} aria-hidden="true"/>}
                            color="red"
                            disabled={busy !== null}
                        >
                            Delete your account
                        </Button>
                    </Popover.Target>
                    <Popover.Dropdown>
                        <Text>Are you sure? This permanently deletes the data Soton Verify holds about you.</Text>
                        <Text className="pb-3">
                            Roles you already have stay, but you will not be able to verify in any new servers.
                        </Text>
                        <Button
                            onClick={deleteData}
                            leftIcon={<FontAwesomeIcon icon={faTrashCan} aria-hidden="true"/>}
                            color="red"
                            loading={busy === 'delete'}
                            disabled={busy !== null}
                        >
                            Delete permanently
                        </Button>
                    </Popover.Dropdown>
                </Popover>
            </div>

            <h2 className="mb-4 mt-4 text-2xl font-semibold">Servers using Soton Verify</h2>

            {guilds.length === 0 ? (
                <Text color="dimmed" className="pb-8">No servers have been approved yet.</Text>
            ) : (
                <div className="flex w-full max-w-xl flex-col gap-2 pb-8">
                    {guilds.map(guild => (
                        <div key={guild.id} className="flex flex-row items-center rounded-md border border-slate-200 p-2">
                            <Avatar
                                src={guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : '/discord-icon.png'}
                                alt=""
                                radius="xl"
                            />
                            <span className="pl-3 text-left font-medium">{guild.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </PageLayout>
    );
}

export const getServerSideProps: GetServerSideProps<ManageProps> = async (context) => {
    const linked = await getLinkedUser(context);

    if (!linked) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    const guilds = await prisma.guild.findMany({
        where: {
            approved: true,
        },
        select: {
            id: true,
            name: true,
            icon: true,
        },
        orderBy: {
            name: 'asc',
        },
    });

    return {
        props: {
            guilds,
        },
    }
}
