'use client';

import { useSession, signOut } from 'next-auth/react';
import CreateNewsForm from '@/components/admin/CreateNewsForm';
import UploadVideoForm from '@/components/admin/UploadVideoForm';
import Link from 'next/link';

export default function AdminDashboard() {
    const { data: session } = useSession();

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 glass-card p-6 rounded-2xl">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Admin Dashboard</h1>
                        <p className="text-text-muted">Welcome back, <span className="text-secondary font-bold">{session?.user?.name}</span></p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/" className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors">
                            View Site
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: '/signin' })}
                            className="px-6 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/20 transition-colors"
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
            </div>
        </div>
    );
}
