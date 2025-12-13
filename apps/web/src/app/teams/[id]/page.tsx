'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Team, Fixture } from '@goalmills/types';
import { footballApi } from '../../../services/footballApi';
import { FixtureCard } from '../../../components/FixtureCard';

export default function TeamDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const teamId = Number(params.id);

    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState<Team | null>(null);
    const [fixtures, setFixtures] = useState<Fixture[]>([]);

    useEffect(() => {
        const loadTeamData = async () => {
            if (!teamId) return;

            try {
                const [teamData, fixturesData] = await Promise.all([
                    footballApi.getTeamById(teamId),
                    footballApi.getFixturesByTeam(teamId),
                ]);

                setTeam(teamData);
                setFixtures(fixturesData);
            } catch (error) {
                console.error('Error loading team data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTeamData();
    }, [teamId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
                <h1 className="text-2xl font-bold text-white mb-4">Team Not Found</h1>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-primary rounded-lg text-white font-bold hover:bg-primary-dark transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const nextMatch = fixtures.find(f => f.fixture.status.short === 'NS' || f.fixture.status.short === 'TBD');
    const pastMatches = fixtures.filter(f => ['FT', 'AET', 'PEN'].includes(f.fixture.status.short)).reverse();

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-surface border-b border-white/5 pt-12 pb-8 px-4 relative overflow-hidden">
                {/* Background Blur Effect */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <Image src={team.logo} alt="" fill className="object-cover blur-3xl scale-150" />
                </div>

                <div className="max-w-4xl mx-auto flex flex-col items-center justify-center relative z-10">
                    <div className="w-32 h-32 relative mb-6 drop-shadow-2xl">
                        <Image src={team.logo} alt={team.name} fill className="object-contain" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2 text-center">{team.name}</h1>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

                {/* Next Match */}
                {nextMatch && (
                    <section className="animate-fade-in">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-secondary">Next Match</span>
                        </h2>
                        <FixtureCard fixture={nextMatch} />
                    </section>
                )}

                {/* Recent Results */}
                <section className="animate-fade-in">
                    <h2 className="text-xl font-bold text-white mb-4">Recent Results</h2>
                    <div className="space-y-4">
                        {pastMatches.length > 0 ? (
                            pastMatches.map(fixture => (
                                <FixtureCard key={fixture.fixture.id} fixture={fixture} />
                            ))
                        ) : (
                            <p className="text-text-muted text-center py-8 bg-surface/30 rounded-xl">No recent matches found.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
