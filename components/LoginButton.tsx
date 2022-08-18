import { useSession, signIn, signOut } from "next-auth/react"
import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import {faDiscord, faMicrosoft} from "@fortawesome/free-brands-svg-icons";

interface ILoginButton {
    style: 'discord' | 'microsoft'
}

export const LoginButton: React.FC<ILoginButton> = ({ style }) => {

    const { data: session } = useSession();

    if (style == 'discord') {
        if (session?.discord.tag) {
            return (
                <>
                    <div className="h-11 max-w-300 border-4 border-green-600 rounded-md flex p-3 flex-row items-center justify-center m-2">
                        <div className='flex-none pr-2'>
                            <FontAwesomeIcon icon={faDiscord} className='text-[#5865F2] text-lg h-4 w-5'/>
                        </div>
                        <div className='flex-auto grow-1'>
                            {session.discord.tag}
                        </div>
                        <div className='flex-none pl-10' onClick={() => signOut()}>
                            <FontAwesomeIcon icon={faCircleCheck} className='text-green-600 text-sm h-5 w-6'/>
                        </div>
                    </div>
                </>
            )
        } else {
            return (
                <>
                    <div onClick={() => signIn('discord')} className="cursor-pointer h-11 w-64 text-white max-w-300 bg-[#5865F2] hover:bg-[#4351E3] rounded-md flex p-3 flex-row items-center justify-center m-2">
                        <div className='flex-none pr-2'>
                            <FontAwesomeIcon icon={faDiscord} className='text-white text-lg h-4 w-5'/>
                        </div>
                        Sign in with Discord
                    </div>
                </>
            )
        }


    } else if (style == 'microsoft') {
        if (session?.microsoft.email) {
            return (
                <>
                    <div className="h-11 max-w-300 grow-1 border-4 border-green-600 rounded-md flex p-3 flex-row items-center justify-center m-2">
                        <div className='flex-none pr-2'>
                            <FontAwesomeIcon icon={faMicrosoft} className='text-[#005C85] text-lg h-4 w-5'/>
                        </div>
                        <div className='flex-auto grow-1'>
                            {session.microsoft.email}
                        </div>
                        <div className='flex-none pl-10' onClick={() => signOut()}>
                            <FontAwesomeIcon icon={faCircleCheck} className='text-green-600 text-sm h-5 w-6'/>
                        </div>
                    </div>
                </>
            )

        } else {
            return (
                <>
                    <div onClick={() => signIn('azure-ad')} className="cursor-pointer h-11 w-64 text-white max-w-300 bg-[#005C85] hover:bg-[#024460] rounded-md flex p-3 flex-row items-center justify-center m-2">
                        <div className='flex-none pr-2'>
                            <FontAwesomeIcon icon={faMicrosoft} className='text-white text-lg h-4 w-5'/>
                        </div>
                        Sign in with Southampton
                    </div>
                </>
            )
        }


    }
    return <></>
}