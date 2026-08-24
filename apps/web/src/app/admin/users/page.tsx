'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { FiArrowLeft, FiLogOut } from 'react-icons/fi';
import { User, UserRole } from '@goalmills/types';
import { useToast } from '../../../components/Toast';

export default function UserManagementPage() {
    const toast = useToast();
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
                toast.success('User role updated successfully');
            } else {
                toast.error('Failed to update role');
            }
        } catch (err) {
            toast.error('An error occurred');
        }
    };

    const deleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setUsers(users.filter(u => u._id !== userId));
                toast.success('User deleted successfully');
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to delete user');
            }
        } catch (err) {
            toast.error('An error occurred');
        }
    };

    if (loading) return <div className="p-8 text-white">Loading users...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-background p-6 pt-[90px]">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-center glass-card p-6 rounded-2xl gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">User Management</h1>
                        <p className="text-text-muted">Manage roles and permissions</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/admin/dashboard" className="flex items-center px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors">
                            <FiArrowLeft className="mr-2" />
                            Back
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: '/signin' })}
                            className="flex items-center px-4 md:px-6 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/20 transition-colors text-sm md:text-base"
                        >
                            <FiLogOut className="mr-2" />
                            Sign Out
                        </button>
                    </div>
                </div>

                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
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
                                                user.role === 'staff' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-slate-500/20 text-slate-400'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => updateRole(user._id, e.target.value)}
                                                    disabled={user._id === session?.user?.id}
                                                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-secondary transition-colors"
                                                >
                                                    <option value="user">User</option>
                                                    <option value="staff">Staff</option>
                                                    <option value="super-admin">Super Admin</option>
                                                </select>
                                                <button
                                                    onClick={() => deleteUser(user._id)}
                                                    disabled={user._id === session?.user?.id}
                                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30"
                                                    title="Delete User"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
