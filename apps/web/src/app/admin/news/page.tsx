'use client';

import NewsList from '@/components/admin/NewsList';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function AdminNewsPage() {
    return (
        <div className="min-h-screen bg-background p-6 pt-[90px]">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-center glass-card p-6 rounded-2xl gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">News Management</h1>
                        <p className="text-text-muted">Edit or delete existing articles</p>
                    </div>
                    <div className="flex items-center">
                        <Link href="/admin/dashboard" className="flex items-center px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors">
                            <FiArrowLeft className="mr-2" />
                        </Link>
                    </div>
                </div>

                <NewsList />
            </div>
        </div>
    );
}
