'use client';

import NewsList from '@/components/admin/NewsList';
import Link from 'next/link';

export default function AdminNewsPage() {
    return (
        <div className="min-h-screen bg-background p-6 pt-[90px]">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center glass-card p-6 rounded-2xl">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">News Management</h1>
                        <p className="text-text-muted">Edit or delete existing articles</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/admin/dashboard" className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors">
                            Dashboard
                        </Link>
                    </div>
                </div>

                <NewsList />
            </div>
        </div>
    );
}
