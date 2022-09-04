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
import {faTrashCan, faDownload } from '@fortawesome/free-solid-svg-icons'
import moment from "moment";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";

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

export default function Manage({ session, guilds }: AuditProps) {

    const router = useRouter()

    const allGuilds = guilds.map(g => {
        const defaultIcon = 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpnggrid.com%2Fwp-content%2Fuploads%2F2021%2F05%2FDiscord-Logo-Circle-2048x2048.png&f=1&nofb=1'
        const icon = `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`

        return (
            <div key={g.id} className='flex flex-row m-2'>
                <Avatar src={g.icon ? icon : defaultIcon} alt="Guild" />
                <h3 className='pl-2'>{g.name}</h3>
            </div>
        )
    });

    const downloadData = () => {

    }

    const deleteData = () => {

    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">

                <h1 className="font-bold text-6xl m-5 text-[#005C85]">Manage verification</h1>
                <p className="text-left">View all of the servers that use our service and get copies of your data<br/><br/>This feature is currently a work in progress</p>

                <div className="flex justify-start flex-wrap flex-row p-5">
                    <div className='p-2'><Button onClick={() => router.push('/')}>Back</Button></div>
                    <div className='p-2'><Button onClick={downloadData} leftIcon={<FontAwesomeIcon icon={faDownload}/>} disabled variant="outline">Get a copy of you data</Button></div>
                    <div className='p-2'><Button onClick={deleteData} leftIcon={<FontAwesomeIcon icon={faTrashCan}/>} disabled color="red">Delete your account</Button></div>
                </div>


                <h2>List of guilds</h2>
                <div>
                    {allGuilds}
                </div>


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