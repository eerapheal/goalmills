'use client';

import { useSession, signOut } from 'next-auth/react';
import CreateNewsForm from '@/components/admin/CreateNewsForm';
import UploadVideoForm from '@/components/admin/UploadVideoForm';
import NewsList from '@/components/admin/NewsList';
import Link from 'next/link';

export default function AdminDashboard() {
    const { data: session } = useSession();

    return (
        <div className="min-h-screen bg-background p-6 pt-[90px]">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 glass-card p-6 rounded-2xl">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Admin Dashboard</h1>
                        <p className="text-text-muted">Welcome back, <span className="text-secondary font-bold">{session?.user?.name}</span> ({session?.user?.role})</p>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-end gap-3 w-full md:w-auto">
                        {session?.user?.role === 'super-admin' && (
                            <Link href="/admin/users" className="px-4 md:px-6 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold border border-blue-500/20 transition-colors text-sm md:text-base">
                                User Management
                            </Link>
                        )}
                        <Link href="/admin/news" className="px-4 md:px-6 py-2 rounded-xl bg-secondary/10 hover:bg-secondary/20 text-secondary font-bold border border-secondary/20 transition-colors text-sm md:text-base">
                            Manage Posts
                        </Link>
                        <Link href="/" className="px-4 md:px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors text-sm md:text-base">
                            View Site
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: '/signin' })}
                            className="px-4 md:px-6 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/20 transition-colors text-sm md:text-base"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <CreateNewsForm />
                    <UploadVideoForm />
                </div>

                {/* Management Section */}
                <div className="grid grid-cols-1 gap-8">
                    <NewsList />
                </div>
            </div>
        </div>
    );
}
