'use client';

import { useState, useEffect } from 'react';
import { Fixture, Standing, BlogPost, VideoHighlight } from '@goalmills/types';
import { footballApi } from '../services/footballApi';
import { FixtureCard } from '../components/FixtureCard';
import { StandingsTable } from '../components/StandingsTable';
import { BlogCard } from '../components/BlogCard';
import { VideoCard } from '../components/VideoCard';

type FootballTab = 'live' | 'upcoming' | 'results' | 'standings' | 'news' | 'videos';

export function FootballScreen() {
    const [activeTab, setActiveTab] = useState<FootballTab>('live');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Data states
    const [liveFixtures, setLiveFixtures] = useState<Fixture[]>([]);
    const [upcomingFixtures, setUpcomingFixtures] = useState<Fixture[]>([]);
    const [finishedFixtures, setFinishedFixtures] = useState<Fixture[]>([]);
    const [standings, setStandings] = useState<Standing[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [videos, setVideos] = useState<VideoHighlight[]>([]);

    const loadData = async () => {
        try {
            const [live, upcoming, finished, standingsData, posts, videoData] = await Promise.all([
                footballApi.getLiveFixtures(),
                footballApi.getUpcomingFixtures(15),
                footballApi.getFinishedFixtures(15),
                footballApi.getStandingsByLeague(39), // Premier League
                footballApi.getBlogPosts(),
                footballApi.getVideoHighlights(),
            ]);

            setLiveFixtures(live);
            setUpcomingFixtures(upcoming);
            setFinishedFixtures(finished);
            setStandings(standingsData);
            setBlogPosts(posts);
            setVideos(videoData);
        } catch (error) {
            console.error('Error loading football data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const tabs: { id: FootballTab; label: string; count?: number }[] = [
        { id: 'live', label: 'Live', count: liveFixtures.length },
        { id: 'upcoming', label: 'Upcoming', count: upcomingFixtures.length },
        { id: 'results', label: 'Results', count: finishedFixtures.length },
        { id: 'standings', label: 'Standings' },
        { id: 'news', label: 'News', count: blogPosts.length },
        { id: 'videos', label: 'Videos', count: videos.length },
    ];

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center p-12 animate-pulse">
                    <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-text-secondary font-medium tracking-wide">Loading football data...</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'live':
                return (
                    <div className="p-4 space-y-2 animate-fade-in">
                        {liveFixtures.length > 0 ? (
                            <>
                                <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 bg-accent-red rounded-full animate-pulse"></span>
                                    Live Matches
                                </h2>
                                {liveFixtures.map((fixture) => (
                                    <FixtureCard key={fixture.fixture.id} fixture={fixture} />
                                ))}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 glass-card rounded-2xl mx-auto max-w-lg mt-8 text-center">
                                <span className="text-6xl mb-6 opacity-80">⚽</span>
                                <p className="text-xl font-bold text-text-primary mb-2">No live matches right now</p>
                                <p className="text-text-muted">Check out Upcoming or Results to stay updated!</p>
                            </div>
                        )}
                    </div>
                );

            case 'upcoming':
                return (
                    <div className="p-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-text-primary mb-6">📅 Upcoming Matches</h2>
                        {upcomingFixtures.map((fixture) => (
                            <FixtureCard key={fixture.fixture.id} fixture={fixture} />
                        ))}
                    </div>
                );

            case 'results':
                return (
                    <div className="p-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-text-primary mb-6">✅ Recent Results</h2>
                        {finishedFixtures.map((fixture) => (
                            <FixtureCard key={fixture.fixture.id} fixture={fixture} />
                        ))}
                    </div>
                );

            case 'standings':
                return (
                    <div className="p-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-text-primary mb-6">🏆 Premier League Standings</h2>
                        <div className="glass-card rounded-xl overflow-hidden">
                            <StandingsTable standings={standings} />
                        </div>
                    </div>
                );

            case 'news':
                return (
                    <div className="p-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-text-primary mb-6">📰 Latest News</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {blogPosts.map((post) => (
                                <BlogCard key={post._id} post={post} />
                            ))}
                        </div>
                    </div>
                );

            case 'videos':
                return (
                    <div className="p-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-text-primary mb-6">🎥 Video Highlights</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {videos.map((video) => (
                                <VideoCard key={video.id} video={video} />
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex-1 bg-background min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-surface/90 backdrop-blur-lg border-b border-white/5">
                <div className="p-4 pt-6 max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-black text-white italic tracking-tighter">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">GOAL</span>
                                <span className="text-white">MILLS</span>
                            </h1>
                            <p className="text-sm text-text-muted font-medium">Premium Sports Analytics</p>
                        </div>
                        {/* Profile or other header items could go here */}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-5 py-2.5 rounded-full border 
                                    transition-all duration-300 whitespace-nowrap text-sm font-bold tracking-wide
                                    ${activeTab === tab.id
                                        ? 'bg-secondary text-surface border-secondary shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105'
                                        : 'bg-surfaceHighlight/50 border-white/5 text-text-secondary hover:bg-surfaceHighlight hover:text-white'
                                    }
                                    active:scale-95
                                `}
                            >
                                <span>{tab.label}</span>
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className={`
                                        text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center
                                        ${activeTab === tab.id
                                            ? 'bg-surface text-secondary'
                                            : 'bg-surface text-text-secondary'}
                                    `}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto pb-20">
                {refreshing && (
                    <div className="flex justify-center py-6 animate-fade-in">
                        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                {renderContent()}
            </div>

            {/* Floating Action Button for Refresh */}
            <button
                onClick={onRefresh}
                disabled={refreshing}
                className="fixed bottom-8 right-8 bg-secondary text-surface p-4 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)]
                         hover:bg-secondary-light hover:scale-110 active:scale-90 transition-all duration-300 
                         disabled:opacity-50 disabled:scale-100 z-50 group"
                aria-label="Refresh Data"
            >
                <svg className={`w-6 h-6 group-hover:rotate-180 transition-transform duration-500 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>
        </div>
    );
}
