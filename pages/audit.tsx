import {Steps} from "@/components/Steps";
import {useSession} from "next-auth/react";
import {MangeLink} from "@/components/MangeLink";
import {Timeline, Text, Avatar, Button, Tooltip} from '@mantine/core';
import {Session, unstable_getServerSession} from "next-auth";
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { IncomingMessage, ServerResponse } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { NextApiRequestCookies } from "next/dist/server/api-utils";
import prisma from "../prisma/client";
import {Guild} from '@prisma/client'
import {useRouter} from "next/router";
import moment from "moment";

// interface IGuild {
//     id: string
//     icon: string | null
//     name: string
//     owner: boolean
//     features: string[]
//     permissions: string
// }

interface IGuild {
    time: string
    guild: string
    endpoint: string
}

interface AuditProps {
    session: Session
    guilds: Guild[]
    accessLog: IGuild[]
}

export default function Audit({ session, guilds, accessLog }: AuditProps) {

    const router = useRouter()

    // @ts-ignore
    accessLog = accessLog.sort((a, b) => new Date(b.time) - new Date(a.time))

    let timelineItems = accessLog.map(g => {
        const defaultIcon = 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpnggrid.com%2Fwp-content%2Fuploads%2F2021%2F05%2FDiscord-Logo-Circle-2048x2048.png&f=1&nofb=1'

        const text = `The guild accessed your data on the ${g.endpoint} endpoint`

        const guild = guilds.find(i => i.id == g.guild);

        if (!guild) {
            return (
                <Timeline.Item key={g.time + g.guild} bullet={
                    <Avatar
                        size={22}
                        radius="xl"
                        src={defaultIcon}
                    />
                } title="Unknown guild">
                    <Text color="dimmed" size="sm">{text}</Text>
                    <Text size="xs" mt={4}>{new Date(g.time).toISOString()}</Text>
                </Timeline.Item>
            )
        }

        const icon = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`

        return (
            <Timeline.Item key={g.time + g.guild} bullet={
                <Avatar
                    size={22}
                    radius="xl"
                    src={guild.icon ? icon : defaultIcon}
                />
            } title={guild.name}>
                <Text color="dimmed" size="sm">{text}</Text>
                <Tooltip label={new Date(g.time).toString()}>
                    <Text size="xs" mt={4}>{moment(g.time).fromNow()}</Text>
                </Tooltip>
            </Timeline.Item>
        )
    });

    if (timelineItems.length == 0) {
        timelineItems.push(<p>Your data has never been accessed</p>)
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">

                <h1 className="font-bold text-6xl m-5 text-[#005C85]">Data access audit log</h1>
                <div className="text-left">
                    <p>We care a lot about your data. That is why we have a robust auditing system to let you know
                        when applications access your data.<br/>Here is a list of every single time your data has been fetched
                        and the application that has fetched it.<br/><br/>If you have any concerns or worries about how your
                        data is being accessed then contact the ECSS web officer</p>
                </div>


                <div className='p-5'>
                    <Button onClick={() => router.push('/')}>Back</Button>
                </div>


                <Timeline active={-1} bulletSize={30} lineWidth={2}>
                    {timelineItems}
                </Timeline>

            </main>
        </div>
    );
}

export async function getServerSideProps(context: { req: (IncomingMessage & { cookies: NextApiRequestCookies; }) | NextApiRequest; res: ServerResponse | NextApiResponse<any>; }) {

    const session = await unstable_getServerSession(context.req, context.res, authOptions)

    if (!session?.discord?.tag) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    const user = await prisma.user.findUnique({
        where: {
            discordTag: session.discord.tag
        }
    })

    if (!user) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    const guilds = await prisma.guild.findMany()

    console.log(guilds)


    const guilds2 = guilds.map(i => ({
        ...i,
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
    }))

    return {
        props: {
            session,
            guilds: guilds2,
            accessLog: user.accessLog
        },
    }
}