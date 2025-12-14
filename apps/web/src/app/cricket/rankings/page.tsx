'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Mock Rankings Data (Copied from mobile implementation)
const rankingsData = {
    test: [
        { rank: 1, team: 'Australia', points: 124, rating: 124, logo: 'https://flagcdn.com/w320/au.png' },
        { rank: 2, team: 'India', points: 120, rating: 120, logo: 'https://flagcdn.com/w320/in.png' },
        { rank: 3, team: 'England', points: 105, rating: 105, logo: 'https://flagcdn.com/w320/gb-eng.png' },
        { rank: 4, team: 'South Africa', points: 103, rating: 103, logo: 'https://flagcdn.com/w320/za.png' },
        { rank: 5, team: 'New Zealand', points: 96, rating: 96, logo: 'https://flagcdn.com/w320/nz.png' },
    ],
    odi: [
        { rank: 1, team: 'India', points: 118, rating: 118, logo: 'https://flagcdn.com/w320/in.png' },
        { rank: 2, team: 'Australia', points: 113, rating: 113, logo: 'https://flagcdn.com/w320/au.png' },
        { rank: 3, team: 'Pakistan', points: 109, rating: 109, logo: 'https://flagcdn.com/w320/pk.png' },
        { rank: 4, team: 'South Africa', points: 106, rating: 106, logo: 'https://flagcdn.com/w320/za.png' },
        { rank: 5, team: 'New Zealand', points: 101, rating: 102, logo: 'https://flagcdn.com/w320/nz.png' },
    ],
    t20: [
        { rank: 1, team: 'India', points: 264, rating: 264, logo: 'https://flagcdn.com/w320/in.png' },
        { rank: 2, team: 'Australia', points: 257, rating: 257, logo: 'https://flagcdn.com/w320/au.png' },
        { rank: 3, team: 'England', points: 252, rating: 252, logo: 'https://flagcdn.com/w320/gb-eng.png' },
        { rank: 4, team: 'West Indies', points: 252, rating: 252, logo: 'https://flagcdn.com/w320/bb.png' },
        { rank: 5, team: 'New Zealand', points: 250, rating: 250, logo: 'https://flagcdn.com/w320/nz.png' },
    ],
};

type Format = 'test' | 'odi' | 't20';

export default function CricketRankingsPage() {
    const router = useRouter();
    const [activeFormat, setActiveFormat] = useState<Format>('test');

    return (
        <div className="min-h-screen bg-[#0a0e27] pt-[90px] pb-10">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-3xl font-bold text-white">ICC Rankings</h1>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 bg-white/5 p-1 rounded-xl w-fit">
                    {(['test', 'odi', 't20'] as Format[]).map((format) => (
                        <button
                            key={format}
                            onClick={() => setActiveFormat(format)}
                            className={`
                                px-6 py-2 rounded-lg font-bold text-sm uppercase transition-all
                                ${activeFormat === format
                                    ? 'bg-secondary text-white shadow-lg'
                                    : 'text-text-secondary hover:text-white hover:bg-white/5'}
                            `}
                        >
                            {format}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-xl font-bold text-white">Men's Team Rankings - {activeFormat.toUpperCase()}</h2>
                    </div>
                    <div className="w-full">
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-white/5 text-xs font-bold text-text-secondary uppercase tracking-wider">
                            <div className="col-span-1">Rank</div>
                            <div className="col-span-7">Team</div>
                            <div className="col-span-2 text-right">Rating</div>
                            <div className="col-span-2 text-right">Points</div>
                        </div>

                        {rankingsData[activeFormat].map((item) => (
                            <div
                                key={item.team}
                                className="grid grid-cols-12 gap-4 px-6 py-4 border-t border-white/5 items-center hover:bg-white/5 transition-colors"
                            >
                                <div className="col-span-1 font-bold text-white">{item.rank}</div>
                                <div className="col-span-7 flex items-center gap-3">
                                    <div className="w-8 h-6 relative shadow-sm">
                                        <Image src={item.logo} alt={item.team} width={32} height={24} className="object-cover rounded-sm w-full h-full" />
                                    </div>
                                    <span className="font-bold text-white text-base">{item.team}</span>
                                </div>
                                <div className="col-span-2 text-right text-white font-medium">{item.rating}</div>
                                <div className="col-span-2 text-right text-white font-medium">{item.points}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
