'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GoalmillsLoader from '@/components/GoalmillsLoader';
import { FiMail, FiCalendar, FiArrowRight, FiBookOpen, FiClock, FiX } from 'react-icons/fi';
import Link from 'next/link';

export default function NewsletterArchivePage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEdition, setSelectedEdition] = useState<any | null>(null);

  useEffect(() => {
    async function fetchArchive() {
      try {
        const res = await fetch('/api/newsletter/archive?limit=24');
        const data = await res.json();
        if (data.success && data.campaigns) {
          setCampaigns(data.campaigns);
        }
      } catch (err) {
        console.error('Failed to load newsletter archive:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchArchive();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Header />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
            <FiBookOpen size={14} /> GoalMills Public Editions
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Newsletter <span className="text-amber-400">Archive</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            Browse through our past daily digests, tactical briefings, and breaking sports intel dispatches.
          </p>

          <div className="pt-2">
            <Link
              href="/newsletter"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
            >
              <FiMail size={16} />
              <span>Subscribe for Free</span>
            </Link>
          </div>
        </div>

        {/* Campaign List */}
        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <GoalmillsLoader />
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((camp) => (
              <div
                key={camp._id}
                className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-amber-500/30 transition-all group space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <FiCalendar size={12} className="text-amber-400" />
                      {camp.sentAt
                        ? new Date(camp.sentAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent'}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-300">
                      {camp.frequencyTier || 'Daily'}
                    </span>
                  </div>

                  <h2 className="text-base font-black text-white group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                    {camp.title}
                  </h2>

                  {camp.previewText && (
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {camp.previewText}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {camp.articleIds?.length || 0} Stories Included
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedEdition(camp)}
                    className="inline-flex items-center gap-1 text-xs font-black text-amber-400 hover:text-amber-300 uppercase tracking-wider"
                  >
                    Read Edition <FiArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 rounded-3xl border border-white/10 text-center space-y-3 max-w-md mx-auto">
            <FiMail size={36} className="mx-auto text-amber-400 opacity-60" />
            <h3 className="text-lg font-bold text-white">No Public Editions Yet</h3>
            <p className="text-xs text-slate-400">
              Our editorial team dispatches daily at 10:00 AM WAT. Sign up now to receive the next edition directly in your inbox.
            </p>
          </div>
        )}

        {/* Edition Preview Modal */}
        {selectedEdition && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/15 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 font-mono">
                    {selectedEdition.frequencyTier || 'Daily'} Digest
                  </span>
                  <h2 className="text-xl font-black text-white mt-1">
                    {selectedEdition.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedEdition(null)}
                  className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <FiX size={20} />
                </button>
              </div>

              {selectedEdition.editorialNote && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed italic">
                  &ldquo;{selectedEdition.editorialNote}&rdquo;
                </div>
              )}

              {selectedEdition.articleIds && selectedEdition.articleIds.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Featured Stories
                  </h3>
                  <div className="space-y-2">
                    {selectedEdition.articleIds.map((art: any) => (
                      <div
                        key={art._id || art.slug}
                        className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{art.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{art.sport} • {art.category}</p>
                        </div>
                        {art.slug && (
                          <Link
                            href={`/news/${art.slug}`}
                            className="text-xs font-bold text-amber-400 hover:underline flex-shrink-0"
                          >
                            Read →
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 text-center">
                <Link
                  href="/newsletter"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider"
                >
                  <FiMail size={14} /> Subscribe to Receive Future Editions
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
