import Head from "next/head";
import { Session } from "next-auth";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { IncomingMessage, ServerResponse } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { NextApiRequestCookies } from "next/dist/server/api-utils";
import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, TextInput, Avatar, Badge, Tooltip, Loader, Notification } from '@mantine/core';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChainBroken, faSearch, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import Link from "next/link";

interface UserResult {
    id: string
    discordId: string | null
    discordTag: string | null
    sotonId: string
    firstName: string
    lastName: string
    school: string
    sotonLinkedDate: string
    discordLinkedDate: string | null
}

interface AdminPageProps {
    session: Session
}

const discordDefaultIcon = 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpnggrid.com%2Fwp-content%2Fuploads%2F2021%2F05%2FDiscord-Logo-Circle-2048x2048.png&f=1&nofb=1';

function discordAvatarUrl(discordId: string | null, icon?: string | null): string {
    if (icon && discordId) {
        return `https://cdn.discordapp.com/avatars/${discordId}/${icon}.png`;
    }
    return discordDefaultIcon;
}

export default function AdminPage({ session }: AdminPageProps) {
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<UserResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [unlinking, setUnlinking] = useState<string | null>(null);

    const fetchUsers = useCallback(async (searchTerm: string) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.set('search', searchTerm);
            const res = await fetch(`/api/v2/admin/users?${params.toString()}`);
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to fetch users');
            }
            const data = await res.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers('');
    }, [fetchUsers]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers(search);
    };

    const handleUnlink = async (discordId: string) => {
        if (!window.confirm('Unlink this Discord account from the Southampton account? The user can re-link at any time.')) {
            return;
        }
        setUnlinking(discordId);
        try {
            const res = await fetch('/api/v2/admin/unlink', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ discordId }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to unlink');
            }
            fetchUsers(search);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUnlinking(null);
        }
    };

    const rows = users.map(user => (
        <tr key={user.id}>
            <td>
                <div className="flex flex-row items-center">
                    <Avatar
                        src={discordAvatarUrl(user.discordId)}
                        alt={user.discordTag || 'No Discord'}
                        size={30}
                        radius="xl"
                    />
                    <span className="ml-2">{user.discordTag || <span className="text-gray-400 italic">Not linked</span>}</span>
                </div>
            </td>
            <td>{user.sotonId}@soton.ac.uk</td>
            <td>{user.firstName} {user.lastName}</td>
            <td>{user.school}</td>
            <td>
                <div className="flex flex-row gap-1">
                    {user.discordId && (
                        <Badge color="blue" size="sm">Discord linked</Badge>
                    )}
                    {user.sotonId && (
                        <Badge color="teal" size="sm">Soton linked</Badge>
                    )}
                </div>
            </td>
            <td>
                {user.discordId && (
                    <Tooltip label="Unlink Discord from this user">
                        <Button
                            size="xs"
                            color="orange"
                            variant="outline"
                            onClick={() => handleUnlink(user.discordId!)}
                            loading={unlinking === user.discordId}
                        >
                            <FontAwesomeIcon icon={faChainBroken} />
                        </Button>
                    </Tooltip>
                )}
            </td>
        </tr>
    ));

    return (
        <div className="flex flex-col items-center min-h-screen py-4 px-4">
            <Head>
                <title>Admin — Soton Verify</title>
            </Head>

            <main className="flex flex-col items-center w-full max-w-6xl">
                <div className="flex flex-row items-center gap-3 mb-2">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-[#005C85] text-2xl" />
                    <h1 className="font-bold text-4xl text-[#005C85]">Admin Dashboard</h1>
                </div>

                <div className="flex flex-row gap-2 mb-6">
                    <Link href="/" passHref>
                        <Button variant="subtle" size="sm">Home</Button>
                    </Link>
                    <Link href="/manage" passHref>
                        <Button variant="subtle" size="sm">Manage</Button>
                    </Link>
                </div>

                {error && (
                    <Notification
                        color="red"
                        onClose={() => setError(null)}
                        className="mb-4"
                    >
                        {error}
                    </Notification>
                )}

                <form onSubmit={handleSearch} className="flex flex-row gap-2 w-full max-w-md mb-6">
                    <TextInput
                        placeholder="Search by name, sotonId, discordTag..."
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        className="flex-1"
                    />
                    <Button type="submit" leftIcon={<FontAwesomeIcon icon={faSearch} />}>
                        Search
                    </Button>
                </form>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader size="lg" />
                    </div>
                ) : (
                    <div className="overflow-x-auto w-full">
                        <Table striped highlightOnHover>
                            <thead>
                                <tr>
                                    <th>Discord</th>
                                    <th>Email</th>
                                    <th>Name</th>
                                    <th>School</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length > 0 ? rows : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-6 text-gray-400">
                                            {search ? 'No users found matching your search' : 'No users found'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                )}
            </main>
        </div>
    );
}

export async function getServerSideProps(context: { req: (IncomingMessage & { cookies: NextApiRequestCookies; }) | NextApiRequest; res: ServerResponse | NextApiResponse<any>; }) {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);

    if (!session?.discord?.id) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    const adminIds = (process.env.ADMIN_DISCORD_IDS || '').split(',').map(id => id.trim()).filter(Boolean);

    if (!adminIds.includes(session.discord.id)) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    return {
        props: {
            session,
        },
    }
}
