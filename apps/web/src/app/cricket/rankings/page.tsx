'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { advancedCricketApi } from '../../../services/advancedCricketApi';
import { CricketStanding } from '@goalmills/types';

type Format = 'test' | 'odi' | 't20';

const LEAGUE_IDS = {
    test: '101',
    odi: '102',
    t20: '103',
};

export default function CricketRankingsPage() {
    const router = useRouter();
    const [activeFormat, setActiveFormat] = useState<Format>('test');
    const [rankings, setRankings] = useState<CricketStanding[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const response = await advancedCricketApi.getStandings({
                    leagueId: LEAGUE_IDS[activeFormat],
                    APIkey: 'mock'
                });
                setRankings(response.result.total || []);
            } catch (error) {
                console.error('Error loading rankings:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [activeFormat]);

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
                                    : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
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

                    {loading ? (
                        <div className="flex justify-center items-center p-12">
                            <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="w-full">
                            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-white/5 text-xs font-bold text-text-secondary uppercase tracking-wider">
                                <div className="col-span-1">Rank</div>
                                <div className="col-span-5">Team</div>
                                <div className="col-span-2 text-right">Matches</div>
                                <div className="col-span-2 text-right">Points</div>
                                <div className="col-span-2 text-right">Rating</div>
                            </div>

                            {rankings.map((item) => (
                                <div
                                    key={item.team_key}
                                    className="grid grid-cols-12 gap-4 px-6 py-4 border-t border-white/5 items-center hover:bg-white/5 transition-colors"
                                >
                                    <div className="col-span-1 font-bold text-white">{item.standing_place}</div>
                                    <div className="col-span-5 flex items-center gap-3">
                                        <div className="w-8 h-6 bg-white/5 rounded-sm flex items-center justify-center">
                                            <span className="text-xs font-bold text-blue-400">{item.standing_team.charAt(0)}</span>
                                        </div>
                                        <span className="font-bold text-white text-base">{item.standing_team}</span>
                                    </div>
                                    <div className="col-span-2 text-right text-white font-medium">{item.standing_MP}</div>
                                    <div className="col-span-2 text-right text-white font-medium">{item.standing_Pts}</div>
                                    <div className="col-span-2 text-right text-secondary font-bold">{item.standing_Pts}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
