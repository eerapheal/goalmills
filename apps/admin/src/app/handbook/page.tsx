'use client';

import { useState, useMemo } from 'react';
import { GOALMILLS_HANDBOOK_SECTIONS, HandbookSection } from '@/lib/handbookData';
import {
  FiBookOpen,
  FiDownload,
  FiPrinter,
  FiCopy,
  FiCheck,
  FiSearch,
  FiFilter,
  FiFileText,
  FiLayers,
  FiCheckSquare,
  FiAward,
  FiVideo,
  FiShare2,
  FiDollarSign,
  FiCompass,
  FiExternalLink,
} from 'react-icons/fi';

export default function AdminHandbookPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSectionId, setActiveSectionId] = useState<string>(GOALMILLS_HANDBOOK_SECTIONS[0].id);
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);

  const categories = [
    'All',
    'Curriculum',
    'Journalism',
    'SEO',
    'Social',
    'Design',
    'Video',
    'Operations',
    'Monetization',
  ];

  const filteredSections = useMemo(() => {
    return GOALMILLS_HANDBOOK_SECTIONS.filter((section) => {
      const matchesCat = selectedCategory === 'All' || section.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.keyPoints.some((kp) => kp.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activeSection = useMemo(() => {
    return (
      GOALMILLS_HANDBOOK_SECTIONS.find((s) => s.id === activeSectionId) ||
      GOALMILLS_HANDBOOK_SECTIONS[0]
    );
  }, [activeSectionId]);

  const handleCopyTemplate = (sectionId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplateId(sectionId);
    setTimeout(() => setCopiedTemplateId(null), 2500);
  };

  const handleDownloadTemplate = (name: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-white print:p-0 print:pt-0 print:bg-white print:text-black">
      {/* Hero & Download Action Card */}
        <div className="glass-card p-5 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-slate-900/90 print:border-none print:shadow-none print:p-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-black uppercase tracking-wider print:hidden">
                <FiBookOpen size={13} />
                <span>Official Operating System & SOPs</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight print:text-black print:text-2xl">
                GoalMills Training Resources & Handbooks
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed print:text-slate-700">
                Complete 2026 Sports Media & Publishing Master Tutorial by{' '}
                <strong className="text-white print:text-black">Ekpenisi Erue Raphael</strong>.
                Standardized curriculum, newsroom verification models, Canva graphics system, video
                workflows, SEO growth, and 100-point staff evaluation rubrics.
              </p>
            </div>

            {/* Download & Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 print:hidden">
              <a
                href="/api/admin/handbook/download"
                download="GOALMILLS-Training-Resources-&-Handbooks.pdf"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                <FiDownload size={16} />
                <span>Download Official PDF</span>
              </a>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/15 transition-all"
                title="Print or Save as PDF"
              >
                <FiPrinter size={15} />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar - Hidden on Print */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 print:hidden">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search chapters, templates, rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={14}
            />
          </div>
        </div>

        {/* Main Content Layout: Sidebar Table of Contents + Active Chapter View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Navigation Drawer / List (4 Cols) - Hidden on Print */}
          <div className="lg:col-span-4 space-y-2.5 max-h-[800px] overflow-y-auto pr-1 no-scrollbar print:hidden">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Handbook Chapters ({filteredSections.length})
              </span>
            </div>

            {filteredSections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSectionId(sec.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 ${
                  activeSectionId === sec.id
                    ? 'bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border-amber-500/40 shadow-lg'
                    : 'bg-slate-900/60 border-white/5 hover:border-white/15 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-amber-400 font-bold">
                    {typeof sec.partNumber === 'number' ? `Part ${sec.partNumber}` : sec.partNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    {sec.category}
                  </span>
                </div>
                <h3
                  className={`text-xs font-bold truncate ${
                    activeSectionId === sec.id ? 'text-amber-300' : 'text-slate-200'
                  }`}
                >
                  {sec.title}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                  {sec.summary}
                </p>
              </button>
            ))}
          </div>

          {/* Right: Active Section Reader & Interactive Tools (8 Cols) */}
          <div className="lg:col-span-8 glass-card p-5 sm:p-8 rounded-3xl border border-white/10 shadow-2xl bg-slate-900/80 space-y-6 print:col-span-12 print:bg-white print:border-none print:shadow-none print:p-0">
            {/* Header */}
            <div className="border-b border-white/10 pb-5 space-y-2 print:border-slate-300">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-black uppercase px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 print:text-black">
                  {typeof activeSection.partNumber === 'number'
                    ? `Part ${activeSection.partNumber}`
                    : activeSection.partNumber}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider print:text-slate-600">
                  {activeSection.category} Module
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight print:text-black">
                {activeSection.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed print:text-slate-800">
                {activeSection.summary}
              </p>
            </div>

            {/* Core Guidelines & Rules Bullet Points */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 print:text-amber-700">
                <span>⚡</span> Core Guidelines & Key Principles
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {activeSection.keyPoints.map((point, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-start gap-2.5 print:bg-slate-100 print:text-black"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5 print:bg-amber-200 print:text-black">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed print:text-black">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist if present */}
            {activeSection.checklist && activeSection.checklist.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 print:text-emerald-700">
                  <FiCheckSquare /> Verification Checklist
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeSection.checklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex items-center gap-2 print:bg-emerald-50 print:border-emerald-200"
                    >
                      <FiCheck className="text-emerald-400 flex-shrink-0" size={14} />
                      <span className="text-xs text-slate-300 font-medium print:text-black">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Standard Template Exporter if present */}
            {activeSection.template && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5 print:text-blue-700">
                    <FiFileText /> {activeSection.template.name}
                  </h4>
                  <div className="flex items-center gap-2 print:hidden">
                    <button
                      onClick={() =>
                        handleCopyTemplate(activeSection.id, activeSection.template!.content)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-all"
                    >
                      {copiedTemplateId === activeSection.id ? (
                        <>
                          <FiCheck className="text-emerald-400" size={13} />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <FiCopy size={13} />
                          <span>Copy Template</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() =>
                        handleDownloadTemplate(
                          activeSection.template!.name,
                          activeSection.template!.content
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-xs font-bold text-blue-400 border border-blue-500/25 transition-all"
                    >
                      <FiDownload size={13} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 font-mono text-xs text-amber-300 whitespace-pre-wrap leading-relaxed overflow-x-auto shadow-inner print:bg-slate-100 print:text-black print:border-slate-300">
                  {activeSection.template.content}
                </div>
              </div>
            )}

            {/* Extended Section Markdown Notes */}
            <div className="pt-4 border-t border-white/10 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line print:text-black print:border-slate-300">
              {activeSection.contentMarkdown}
            </div>
          </div>
        </div>
    </div>
  );
}
