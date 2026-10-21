import Link from "next/link";
import React from "react";
import type {GetServerSideProps} from "next";
import {Alert, Avatar, Button, Text, Timeline, Tooltip} from '@mantine/core';
import moment from "moment";
import {PageLayout} from "@/components/PageLayout";
import {getLinkedUser} from "@/lib/serverAuth";
import prisma from "../prisma/client";

interface AccessLogEntry {
    time: string
    guild: string
    endpoint: string
}

interface GuildSummary {
    id: string
    name: string
    icon: string | null
}

interface AuditProps {
    guilds: GuildSummary[]
    accessLog: AccessLogEntry[]
}

const DEFAULT_ICON = '/discord-icon.png';

function accessText(entry: AccessLogEntry): string {
    if (entry.endpoint === 'verified') {
        return 'A server checked that you are verified.';
    }

    if (entry.endpoint === 'user' || entry.endpoint === '[userId]') {
        return 'A server looked up your verification details.';
    }

    return 'A server used the verification API to look at your data.';
}

function timestamp(value: string): string {
    return new Date(value).toString();
}

export default function Audit({guilds, accessLog}: AuditProps) {
    const entries = React.useMemo(() => {
        return [...accessLog]
            .filter(entry => !Number.isNaN(new Date(entry.time).getTime()))
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    }, [accessLog]);

    return (
        <PageLayout title="Data access audit log - Soton Verify" mainClassName="max-w-3xl">
            <h1 className="m-5 text-3xl font-bold text-[#005C85] sm:text-4xl md:text-5xl">
                Data access audit log
            </h1>

            <div className="max-w-2xl text-left">
                <p>
                    We keep a record of every time a server asks Soton Verify about your
                    verification. Here is the full list, along with the server that made the
                    request.
                </p>
                <p className="pt-3">
                    If you have any concerns about how your data is being accessed, contact the
                    ECSS web officer.
                </p>
            </div>

            <div className='py-5'>
                <Button component={Link} href="/" variant="default">Back</Button>
            </div>

            {entries.length === 0 ? (
                <Alert color="blue" className="w-full max-w-xl" role="status">
                    No server has accessed your data yet.
                </Alert>
            ) : (
                <Timeline active={-1} bulletSize={30} lineWidth={2} className="w-full max-w-xl text-left">
                    {entries.map((entry, index) => {
                        const guild = guilds.find(candidate => candidate.id === entry.guild);
                        const icon = guild?.icon
                            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                            : DEFAULT_ICON;

                        return (
                            <Timeline.Item
                                key={`${entry.time}-${entry.guild}-${index}`}
                                bullet={<Avatar size={22} radius="xl" src={icon} alt=""/>}
                                title={guild?.name || 'Unknown server'}
                            >
                                <Text color="dimmed" size="sm">{accessText(entry)}</Text>
                                <Tooltip label={timestamp(entry.time)}>
                                    <Text size="xs" mt={4} suppressHydrationWarning>
                                        {moment(entry.time).fromNow()}
                                    </Text>
                                </Tooltip>
                            </Timeline.Item>
                        );
                    })}
                </Timeline>
            )}
        </PageLayout>
    );
}

export const getServerSideProps: GetServerSideProps<AuditProps> = async (context) => {
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
        select: {
            id: true,
            name: true,
            icon: true,
        },
        orderBy: {
            name: 'asc',
        },
    });

    const rawLog = linked.user.accessLog;
    const accessLog: AccessLogEntry[] = [];

    if (Array.isArray(rawLog)) {
        for (const raw of rawLog) {
            if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
                continue;
            }

            const entry = raw as Record<string, unknown>;
            if (typeof entry.time !== 'string') {
                continue;
            }

            accessLog.push({
                time: entry.time,
                guild: typeof entry.guild === 'string' ? entry.guild : '',
                endpoint: typeof entry.endpoint === 'string' ? entry.endpoint : '',
            });
        }
    }

    return {
        props: {
            guilds,
            accessLog,
        },
    }
}
