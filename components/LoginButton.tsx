import {signIn, signOut, useSession} from "next-auth/react"
import React from "react";
import {Button} from "@mantine/core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleCheck} from '@fortawesome/free-solid-svg-icons'
import {faDiscord, faMicrosoft} from "@fortawesome/free-brands-svg-icons";

interface ILoginButton {
    style: 'discord' | 'microsoft'
}

/**
 * Renders either a sign-in button or a non-interactive "linked" status card.
 *
 * Discord no longer has a sign-in path here: linking is done through the
 * bot-issued link on /link. The green tick is deliberately not clickable; a
 * separate, labelled Sign out button controls the session.
 */
export const LoginButton: React.FC<ILoginButton> = ({style}) => {
    const {data: session} = useSession();

    if (style === 'discord') {
        if (!session?.discord.tag) {
            return null;
        }

        return (
            <div className="m-2 flex min-h-[44px] w-full max-w-xs flex-row items-center justify-center rounded-md border-4 border-green-600 p-3">
                <div className='flex-none pr-2'>
                    <FontAwesomeIcon icon={faDiscord} className='h-4 w-5 text-lg text-[#5865F2]' aria-hidden="true"/>
                </div>
                <div className='min-w-0 flex-auto break-all text-left'>
                    {session.discord.tag}
                </div>
                <FontAwesomeIcon icon={faCircleCheck} className='ml-2 h-5 w-6 flex-none text-green-600' aria-hidden="true"/>
            </div>
        )
    }

    if (style === 'microsoft') {
        if (!session?.microsoft.email) {
            return (
                <button
                    type="button"
                    onClick={() => signIn('azure-ad')}
                    className="m-2 flex min-h-[44px] w-full max-w-xs cursor-pointer flex-row items-center justify-center rounded-md bg-[#005C85] p-3 text-white hover:bg-[#024460]"
                >
                    <div className='flex-none pr-2'>
                        <FontAwesomeIcon icon={faMicrosoft} className='h-4 w-5 text-lg' aria-hidden="true"/>
                    </div>
                    Sign in with Southampton
                </button>
            )
        }

        return (
            <div className="m-2 flex w-full max-w-xs flex-col items-stretch">
                <div className="flex min-h-[44px] flex-row items-center justify-center rounded-md border-4 border-green-600 p-3">
                    <div className='flex-none pr-2'>
                        <FontAwesomeIcon icon={faMicrosoft} className='h-4 w-5 text-lg text-[#005C85]' aria-hidden="true"/>
                    </div>
                    <div className='min-w-0 flex-auto break-all text-left'>
                        {session.microsoft.email}
                    </div>
                    <FontAwesomeIcon icon={faCircleCheck} className='ml-2 h-5 w-6 flex-none text-green-600' aria-hidden="true"/>
                </div>
                <Button
                    variant="subtle"
                    size="xs"
                    className="mt-1"
                    onClick={() => signOut({callbackUrl: '/'})}
                >
                    Sign out
                </Button>
            </div>
        )
    }

    return null
}
