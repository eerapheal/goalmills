import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { generateOrganizationSchema } from '@/lib/seo/schemaGenerator';
import { AUTHORS_REGISTRY } from '@/lib/entityService';
import { FiCheckCircle, FiShield, FiSend, FiFileText, FiAward } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'About GoalMills: Editorial Mission, Standards & Leadership',
  description:
    'About GoalMills: Enterprise sports platform founded by Ekpenisi Erue Raphael. Learn about our editorial standards, verification process, corrections policy, and team.',
};

export default function AboutUsPage() {
  const orgSchema = generateOrganizationSchema();
  const authors = Object.values(AUTHORS_REGISTRY);

  return (
    <main className="min-h-screen bg-[#070B12] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <div className="max-w-5xl mx-auto space-y-8">
        <Breadcrumbs items={[{ name: 'About GoalMills', url: '/about' }]} />

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0c1830] via-[#091224] to-[#050b16] p-8 sm:p-12 shadow-2xl">
          <div className="max-w-3xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-black uppercase tracking-widest inline-flex items-center gap-1.5">
              <FiShield /> ENTERPRISE SPORTS MEDIA
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Building the Future of Sports Intelligence
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              GoalMills is a next-generation sports network combining real-time match data,
              verified transfer market reporting, and elite tactical analysis.
            </p>
          </div>
        </div>

        {/* Editorial Standards & Corrections Policy (Section 24) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div id="editorial-standards" className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600/30 text-blue-400 text-sm">
                <FiFileText />
              </span>
              <span>Editorial Standards & Verification</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every story published on GoalMills undergoes strict fact-checking. We cross-reference
              transfer claims with multiple Tier-1 industry sources and official club representatives
              prior to publication.
            </p>
          </div>

          <div id="corrections-policy" className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600/30 text-emerald-400 text-sm">
                <FiCheckCircle />
              </span>
              <span>Corrections Policy</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Transparency is paramount to our editorial integrity. If an inaccuracy occurs in
              breaking coverage or match scoring, corrections are prominently noted with timestamped
              clarifications.
            </p>
          </div>
        </div>

        {/* Leadership & Editorial Team */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiAward className="text-amber-400" />
                <span>Editorial Leadership & Journalists</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Meet the analysts and writers shaping our daily sports coverage.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {authors.map((author) => (
              <Link
                key={author.slug}
                href={`/authors/${author.slug}`}
                className="group flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/30 transition-all"
              >
                <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-slate-900 flex-shrink-0 border border-white/10">
                  <Image
                    src={author.photo}
                    alt={author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                    {author.name}
                  </h3>
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block mb-1">
                    {author.role}
                  </span>
                  <p className="text-xs text-slate-400 line-clamp-2">{author.bio}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
