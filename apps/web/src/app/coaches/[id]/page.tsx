'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { advancedFootballApi } from '../../../services/advancedFootballApi';
import { FootballCoach } from '@goalmills/types';
import { BackButton } from '../../../components/BackButton';

export default function CoachDetailsPage() {
  const params = useParams();
  const router = useRouter();
  // Since we don't have IDs for coaches in the mock, we might use name or index.
  // The route is [id]. I'll treat ID as index or random for this mock if not numeric.
  const coachId = params.id;

  const [loading, setLoading] = useState(true);
  const [coach, setCoach] = useState<FootballCoach | null>(null);

  useEffect(() => {
    const loadCoach = async () => {
      try {
        const res = await advancedFootballApi.getCoaches();
        const coaches = res.result;
        // Just pick a random one or based on ID hash for consistency if real ID not available
        const index = Number(coachId) % coaches.length;
        const found = isNaN(index) ? coaches[0] : coaches[index];
        setCoach(found);
      } catch (error) {
        console.error('Error loading coach:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCoach();
  }, [coachId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!coach) return null;

  return (
    <div className="min-h-screen bg-background pt-[90px] pb-20 p-4">
      <div className="max-w-2xl mx-auto glass-card rounded-2xl overflow-hidden animate-fade-in relative">
        <BackButton className="absolute top-4 left-4 z-20" />
        <div className="bg-gradient-to-r from-secondary/20 to-primary/20 p-8 text-center border-b border-white/5">
          <div className="w-40 h-40 mx-auto rounded-full p-2 bg-surfaceHighlight/50 mb-6">
            <img
              src={coach.coache_image}
              alt={coach.coache}
              className="w-full h-full rounded-full object-cover shadow-2xl"
            />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">{coach.coache}</h1>
          <p className="text-xl text-secondary font-bold">{coach.team_name}</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <span className="text-text-muted">Nationality</span>
            <span className="text-white font-bold text-lg">{coach.coache_country}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <span className="text-text-muted">Career Trophies</span>
            <span className="text-secondary font-black text-2xl">{coach.trophies || 'N/A'}</span>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold text-white mb-4">Career Highlights</h3>
            <p className="text-text-muted leading-relaxed">
              Detailed career history and achievements for {coach.coache} will appear here. This
              section tracks performance across different seasons and clubs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
