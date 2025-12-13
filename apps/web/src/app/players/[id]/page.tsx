'use client';

import { useParams, useRouter } from 'next/navigation';

export default function PlayerDetailsPage() {
    const params = useParams();
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
            <span className="text-6xl mb-6">🏃‍♂️</span>
            <h1 className="text-3xl font-black text-white mb-2">Player Profile</h1>
            <p className="text-text-muted mb-8 text-lg">Detailed player statistics and history coming soon.</p>

            <button
                onClick={() => router.back()}
                className="px-8 py-3 bg-secondary text-surface font-bold rounded-full hover:bg-secondary-light transition-all shadow-lg hover:scale-105"
            >
                Go Back
            </button>
        </div>
    );
}
