'use client';

import { useRouter } from 'next/navigation';

export default function CricketPlayerDetailsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#0a0e27] pt-[90px] pb-10">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-sm font-bold text-text-muted uppercase tracking-wider">Player Details</span>
                </div>

                {/* Not Available Message */}
                <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
                    <div className="mb-6">
                        <svg className="w-24 h-24 mx-auto text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Player Details Not Available</h2>
                    <p className="text-text-secondary mb-6 max-w-md mx-auto">
                        Individual player statistics and details are not currently supported by the cricket API.
                        Please check back later for updates.
                    </p>
                    <button
                        onClick={() => router.back()}
                        className="bg-secondary text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-80 transition-all"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
