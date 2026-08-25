'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { advancedCricketApi } from '../../../services/advancedCricketApi';
import { CricketIccRankingItem } from '@goalmills/types';

type Format = 'test' | 'odi' | 't20';
type Category = 'teams' | 'batting' | 'bowling' | 'allrounders';
type Gender = 'men' | 'women';

export default function CricketRankingsPage() {
    const router = useRouter();
    const [activeGender, setActiveGender] = useState<Gender>('men');
    const [activeFormat, setActiveFormat] = useState<Format>('test');
    const [activeCategory, setActiveCategory] = useState<Category>('teams');
    const [rankings, setRankings] = useState<CricketIccRankingItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const response = await advancedCricketApi.getRankings(
                    activeFormat,
                    activeCategory,
                    activeGender
                );
                setRankings(response.rankings || []);
            } catch (error) {
                console.error('Error loading ICC rankings:', error);
                setRankings([]);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [activeFormat, activeCategory, activeGender]);

    return (
        <div className="min-h-screen bg-[#0a0e27] pt-[120px] pb-24">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header with Back Button */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                        </button>
                        <div>
                            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Official Leaderboards</span>
                            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">ICC World Rankings</h1>
                        </div>
                    </div>

                    {/* Gender Toggle */}
                    <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit">
                        <button
                            onClick={() => setActiveGender('men')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeGender === 'men' ? 'bg-secondary text-white shadow-lg' : 'text-text-muted hover:text-white'
                            }`}
                        >
                            Men&apos;s Cricket
                        </button>
                        <button
                            onClick={() => setActiveGender('women')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeGender === 'women' ? 'bg-secondary text-white shadow-lg' : 'text-text-muted hover:text-white'
                            }`}
                        >
                            Women&apos;s Cricket
                        </button>
                    </div>
                </div>

                {/* Filters Row: Format & Category */}
                <div className="glass-card rounded-3xl p-4 md:p-6 mb-8 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Format Tabs */}
                    <div className="flex gap-2 bg-[#0a0e27]/80 p-1.5 rounded-2xl border border-white/10 overflow-x-auto">
                        {(['test', 'odi', 't20'] as Format[]).map((fmt) => (
                            <button
                                key={fmt}
                                onClick={() => setActiveFormat(fmt)}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeFormat === fmt ? 'bg-blue-600 text-white shadow-lg' : 'text-text-muted hover:text-white'
                                }`}
                            >
                                {fmt === 't20' ? 'T20I' : fmt.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 bg-[#0a0e27]/80 p-1.5 rounded-2xl border border-white/10 overflow-x-auto">
                        {[
                            { id: 'teams', label: 'Teams' },
                            { id: 'batting', label: 'Batting' },
                            { id: 'bowling', label: 'Bowling' },
                            { id: 'allrounders', label: 'All-Rounders' },
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id as Category)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeCategory === cat.id ? 'bg-secondary text-white shadow-lg' : 'text-text-muted hover:text-white'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Rankings Table Card */}
                <div className="glass-card rounded-[2.5rem] p-6 md:p-10 border border-white/5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                        <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                            <span className="text-secondary">🏆</span>
                            {activeGender.toUpperCase()}&apos;S {activeFormat.toUpperCase()} {activeCategory.toUpperCase()} STANDINGS
                        </h2>
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                            Updated March 2026
                        </span>
                    </div>

                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Fetching ICC Matrix...</p>
                        </div>
                    ) : rankings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-text-muted">
                                        <th className="py-4 px-4 w-16 text-center">Rank</th>
                                        <th className="py-4 px-4">
                                            {activeCategory === 'teams' ? 'Team / Nation' : 'Player / Athlete'}
                                        </th>
                                        {activeCategory !== 'teams' && <th className="py-4 px-4">Country</th>}
                                        <th className="py-4 px-4 text-right">Rating</th>
                                        {activeCategory === 'teams' && <th className="py-4 px-4 text-right">Points</th>}
                                        <th className="py-4 px-4 text-center w-20">Trend</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {rankings.map((item, idx) => {
                                        const isTop3 = item.rank <= 3;
                                        const rankColor =
                                            item.rank === 1
                                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                                : item.rank === 2
                                                ? 'bg-slate-300/20 text-slate-200 border-slate-300/30'
                                                : item.rank === 3
                                                ? 'bg-amber-700/20 text-amber-500 border-amber-700/30'
                                                : 'bg-white/5 text-text-muted border-white/5';

                                        return (
                                            <tr
                                                key={idx}
                                                className="group hover:bg-white/5 transition-colors cursor-pointer"
                                                onClick={() => {
                                                    if (item.player_key) router.push(`/cricket/players/${item.player_key}`);
                                                }}
                                            >
                                                <td className="py-4 px-4 text-center">
                                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl border text-xs font-black tabular-nums ${rankColor}`}>
                                                        {item.rank}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-blue-400">
                                                            {(item.team_name || item.player_name || 'C').charAt(0)}
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-black text-white uppercase group-hover:text-secondary transition-colors">
                                                                {item.team_name || item.player_name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {activeCategory !== 'teams' && (
                                                    <td className="py-4 px-4">
                                                        <span className="text-xs font-bold text-text-secondary uppercase">
                                                            {item.country}
                                                        </span>
                                                    </td>
                                                )}

                                                <td className="py-4 px-4 text-right">
                                                    <span className="text-base font-black text-amber-400 tabular-nums">
                                                        {item.rating}
                                                    </span>
                                                </td>

                                                {activeCategory === 'teams' && (
                                                    <td className="py-4 px-4 text-right">
                                                        <span className="text-xs font-bold text-text-muted tabular-nums">
                                                            {item.points || '-'}
                                                        </span>
                                                    </td>
                                                )}

                                                <td className="py-4 px-4 text-center">
                                                    {item.trend === 'up' ? (
                                                        <span className="text-emerald-400 text-xs font-bold">▲</span>
                                                    ) : item.trend === 'down' ? (
                                                        <span className="text-rose-400 text-xs font-bold">▼</span>
                                                    ) : (
                                                        <span className="text-white/30 text-xs font-bold">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-16 text-center text-text-muted font-bold uppercase tracking-widest text-xs">
                            No ranking entries available for this category.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
