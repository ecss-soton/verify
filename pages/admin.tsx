import Link from "next/link";
import React, {useCallback, useEffect, useState} from "react";
import type {GetServerSideProps} from "next";
import {Avatar, Badge, Button, Loader, Notification, Table, Text, TextInput, Title, Tooltip} from '@mantine/core';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChainBroken, faCheck, faSearch, faShieldHalved} from '@fortawesome/free-solid-svg-icons';
import {PageLayout} from "@/components/PageLayout";
import {getAdminSession} from "@/lib/serverAuth";

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

interface PendingGuild {
    id: string
    name: string
    icon: string | null
    ownerId: string
    inviteLink: string
    roleName: string
    roleId: string
    createdAt: string
}

const DEFAULT_ICON = '/discord-icon.png';

function guildIcon(guild: PendingGuild): string {
    return guild.icon
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
        : DEFAULT_ICON;
}

export default function AdminPage() {
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<UserResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [unlinking, setUnlinking] = useState<string | null>(null);
    const [guilds, setGuilds] = useState<PendingGuild[]>([]);
    const [guildsLoading, setGuildsLoading] = useState(false);
    const [approving, setApproving] = useState<string | null>(null);

    const fetchUsers = useCallback(async (searchTerm: string) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (searchTerm) params.set('search', searchTerm);
            const res = await fetch(`/api/v2/admin/users?${params.toString()}`);
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.message || 'Failed to fetch users');
            }

            setUsers(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchGuilds = useCallback(async () => {
        setGuildsLoading(true);

        try {
            const res = await fetch('/api/v2/admin/guilds?status=pending');
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.message || 'Failed to fetch pending guilds');
            }

            setGuilds(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setGuildsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers('');
        fetchGuilds();
    }, [fetchUsers, fetchGuilds]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers(search);
    };

    const handleUnlink = async (discordId: string) => {
        if (!window.confirm('Unlink this Discord account from the Southampton account? The user can re-link at any time.')) {
            return;
        }

        setUnlinking(discordId);
        setError(null);

        try {
            const res = await fetch('/api/v2/admin/unlink', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({discordId}),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.message || 'Failed to unlink');
            }

            setNotice(`Discord account ${discordId} was unlinked.`);
            fetchUsers(search);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUnlinking(null);
        }
    };

    const handleApprove = async (guild: PendingGuild) => {
        setApproving(guild.id);
        setError(null);

        try {
            const res = await fetch('/api/v2/admin/approve-guild', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({guildId: guild.id}),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.message || 'Failed to approve guild');
            }

            setGuilds(current => current.filter(candidate => candidate.id !== guild.id));
            setNotice(`${guild.name} was approved.`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setApproving(null);
        }
    };

    const rows = users.map(user => (
        <tr key={user.id}>
            <td>
                <div className="flex flex-row items-center">
                    <Avatar
                        src={DEFAULT_ICON}
                        alt=""
                        size={30}
                        radius="xl"
                    />
                    <span className="ml-2">
                        {user.discordTag || <span className="italic text-gray-400">Not linked</span>}
                    </span>
                </div>
            </td>
            <td>{user.sotonId}@soton.ac.uk</td>
            {/* The database stores surname in firstName; the v2 user API compensates. */}
            <td>{user.lastName} {user.firstName}</td>
            <td>{user.school}</td>
            <td>
                {user.discordId ? (
                    <Badge color="blue" size="sm">Discord linked</Badge>
                ) : (
                    <Badge color="gray" size="sm">Not linked</Badge>
                )}
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
                            aria-label={`Unlink ${user.discordTag || user.sotonId}`}
                        >
                            <FontAwesomeIcon icon={faChainBroken} aria-hidden="true"/>
                        </Button>
                    </Tooltip>
                )}
            </td>
        </tr>
    ));

    return (
        <PageLayout title="Admin - Soton Verify" mainClassName="max-w-6xl">
            <div className="mb-2 flex flex-row items-center gap-3">
                <FontAwesomeIcon icon={faShieldHalved} className="text-2xl text-[#005C85]" aria-hidden="true"/>
                <h1 className="text-3xl font-bold sm:text-4xl">Admin dashboard</h1>
            </div>

            <div className="mb-6 flex flex-row gap-2">
                <Button component={Link} href="/" variant="subtle" size="sm">Home</Button>
                <Button component={Link} href="/manage" variant="subtle" size="sm">Manage</Button>
            </div>

            {error && (
                <Notification color="red" onClose={() => setError(null)} className="mb-4" role="alert">
                    {error}
                </Notification>
            )}

            {notice && (
                <Notification color="green" onClose={() => setNotice(null)} className="mb-4" role="status">
                    {notice}
                </Notification>
            )}

            <form onSubmit={handleSearch} className="mb-6 flex w-full max-w-md flex-row gap-2">
                <TextInput
                    aria-label="Search users"
                    placeholder="Search by name, sotonId, discordTag..."
                    value={search}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                    className="flex-1"
                />
                <Button type="submit" leftIcon={<FontAwesomeIcon icon={faSearch} aria-hidden="true"/>}>
                    Search
                </Button>
            </form>

            <Text size="xs" color="dimmed" className="mb-2 self-start text-left">
                Showing up to 50 users. Use search to narrow the list.
            </Text>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader size="lg"/>
                </div>
            ) : (
                <div className="w-full overflow-x-auto text-left">
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
                                    <td colSpan={6} className="py-6 text-center text-gray-400">
                                        {search ? 'No users found matching your search' : 'No users found'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            )}

            <div className="mt-12 w-full max-w-5xl">
                <Title order={2} className="mb-1 text-left text-2xl">Pending guilds</Title>
                <Text size="sm" color="dimmed" className="mb-4 text-left">
                    Servers that have run /setup but are not approved yet.
                </Text>

                {guildsLoading ? (
                    <div className="flex justify-center py-6">
                        <Loader/>
                    </div>
                ) : guilds.length === 0 ? (
                    <Text color="dimmed" className="text-left">No guilds are waiting for approval.</Text>
                ) : (
                    <div className="overflow-x-auto text-left">
                        <Table striped highlightOnHover>
                            <thead>
                                <tr>
                                    <th>Server</th>
                                    <th>Owner</th>
                                    <th>Verified role</th>
                                    <th>Invite</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {guilds.map(guild => (
                                    <tr key={guild.id}>
                                        <td>
                                            <div className="flex flex-row items-center">
                                                <Avatar src={guildIcon(guild)} alt="" size={30} radius="xl"/>
                                                <span className="ml-2">{guild.name}</span>
                                            </div>
                                        </td>
                                        <td>{guild.ownerId}</td>
                                        <td>{guild.roleName}</td>
                                        <td>
                                            <a
                                                href={guild.inviteLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[#005C85] underline"
                                            >
                                                Open invite
                                            </a>
                                        </td>
                                        <td>
                                            <Button
                                                size="xs"
                                                color="green"
                                                leftIcon={<FontAwesomeIcon icon={faCheck} aria-hidden="true"/>}
                                                onClick={() => handleApprove(guild)}
                                                loading={approving === guild.id}
                                                disabled={approving !== null}
                                            >
                                                Approve
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </div>
        </PageLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getAdminSession(context);

    if (!session) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    return {
        props: {},
    }
}
