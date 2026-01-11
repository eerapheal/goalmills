'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { User, UserRole } from '@goalmills/types';

export default function UserManagementPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                setError('Failed to fetch users');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const updateRole = async (userId: string, newRole: string) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (res.ok) {
                setUsers(users.map(u => u._id === userId ? { ...u, role: newRole as any } : u));
            } else {
                alert('Failed to update role');
            }
        } catch (err) {
            alert('An error occurred');
        }
    };

    if (loading) return <div className="p-8 text-white">Loading users...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-background p-6 pt-[90px]">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center glass-card p-6 rounded-2xl">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">User Management</h1>
                        <p className="text-text-muted">Manage roles and permissions</p>
                    </div>
                    <Link href="/admin/dashboard" className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors">
                        Back to Dashboard
                    </Link>
                </div>

                <div className="glass-card rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-text-muted uppercase text-xs font-bold tracking-widest">
                                <th className="px-6 py-4">Username</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4">Current Role</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((user) => (
                                <tr key={user._id} className="text-white hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-bold">{user.username}</td>
                                    <td className="px-6 py-4 text-text-muted">{user.email}</td>
                                    <td className="px-6 py-4 text-xs">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${user.role === 'super-admin' ? 'bg-purple-500/20 text-purple-400' :
                                            user.role === 'staful' ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-slate-500/20 text-slate-400'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => updateRole(user._id, e.target.value)}
                                            disabled={user._id === session?.user?.id}
                                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-secondary transition-colors"
                                        >
                                            <option value="user">User</option>
                                            <option value="staful">Staful</option>
                                            <option value="super-admin">Super Admin</option>
                                        </select>                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
