'use client';

import { useState } from 'react';
import Link from 'next/link';
import { openApiSpec } from '@/lib/openapi';
import {
  FiCode,
  FiBookOpen,
  FiPlay,
  FiCopy,
  FiCheck,
  FiExternalLink,
  FiServer,
} from 'react-icons/fi';

const METHOD_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  GET: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  POST: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  PUT: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  DELETE: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  PATCH: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
};

export default function ApiDocsPage() {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [testResponses, setTestResponses] = useState<Record<string, any>>({});
  const [loadingRoute, setLoadingRoute] = useState<string | null>(null);

  // Group paths into flat array with method
  const endpoints = Object.entries(openApiSpec.paths).flatMap(([pathUrl, methods]) =>
    Object.entries(methods).map(([method, details]: [string, any]) => ({
      path: pathUrl,
      method: method.toUpperCase(),
      ...details,
    }))
  );

  const tags = ['All', ...Array.from(new Set(endpoints.flatMap((e) => e.tags || [])))];

  const filteredEndpoints = endpoints.filter((e) => {
    const matchesTag = selectedTag === 'All' || (e.tags && e.tags.includes(selectedTag));
    const matchesSearch =
      searchQuery === '' ||
      e.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.summary && e.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(id);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleExecute = async (endpointKey: string, path: string, method: string) => {
    setLoadingRoute(endpointKey);
    try {
      // Build sample URL for GET
      const url = path.replace(/\{([^}]+)\}/g, 'sample-id');
      const res = await fetch(url, { method });
      const data = await res
        .json()
        .catch(() => ({ status: res.status, statusText: res.statusText }));
      setTestResponses((prev) => ({
        ...prev,
        [endpointKey]: { status: res.status, data },
      }));
    } catch (err: any) {
      setTestResponses((prev) => ({
        ...prev,
        [endpointKey]: { status: 500, error: err.message },
      }));
    } finally {
      setLoadingRoute(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <FiBookOpen size={24} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                    {openApiSpec.info.title}
                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono font-bold">
                      v{openApiSpec.info.version} (OpenAPI 3.1)
                    </span>
                  </h1>
                  <p className="text-sm text-slate-400 mt-1">
                    Multi-sport realtime engine, editorial news, highlights & push alert APIs.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/api/openapi.json"
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
                >
                  <FiCode size={14} />
                  <span>openapi.json</span>
                  <FiExternalLink size={12} />
                </Link>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
              <div className="flex items-center gap-3">
                <FiServer className="text-blue-400" />
                <div>
                  <div className="text-xs text-slate-400">Total Endpoints</div>
                  <div className="text-lg font-bold text-white">{endpoints.length} Routes</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Format</div>
                <div className="text-lg font-bold text-emerald-400">JSON / SSE</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Authentication</div>
                <div className="text-lg font-bold text-amber-400">JWT / NextAuth</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Cache Layer</div>
                <div className="text-lg font-bold text-cyan-400">Redis (60s TTL)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search route or keyword..."
              className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Endpoints List */}
        <div className="space-y-4">
          {filteredEndpoints.map((ep) => {
            const epKey = `${ep.method}-${ep.path}`;
            const colors = METHOD_COLORS[ep.method] || METHOD_COLORS.GET;
            const result = testResponses[epKey];

            return (
              <div
                key={epKey}
                className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5 hover:border-slate-700 transition-all shadow-lg shadow-black/20"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${colors.bg} ${colors.text} ${colors.border}`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-sm font-semibold text-white break-all">
                      {ep.path}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 font-medium">
                      {ep.tags?.[0] || 'General'}
                    </span>
                    <button
                      onClick={() => handleCopy(ep.path, epKey)}
                      title="Copy endpoint path"
                      className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedPath === epKey ? (
                        <FiCheck size={14} className="text-emerald-400" />
                      ) : (
                        <FiCopy size={14} />
                      )}
                    </button>
                    {ep.method === 'GET' && (
                      <button
                        onClick={() => handleExecute(epKey, ep.path, ep.method)}
                        disabled={loadingRoute === epKey}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                      >
                        <FiPlay size={12} />
                        <span>{loadingRoute === epKey ? 'Testing...' : 'Try It'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-2">{ep.summary || ep.description}</p>

                {/* Parameters Breakdown */}
                {ep.parameters && ep.parameters.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/60">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Query & Path Parameters
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ep.parameters.map((param: any) => (
                        <div
                          key={param.name}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300"
                        >
                          <span className="text-blue-400">{param.name}</span>
                          {param.required && <span className="text-rose-400 ml-0.5">*</span>}
                          <span className="text-slate-500 ml-1">
                            ({param.schema?.type || 'string'})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Test Response Output */}
                {result && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-x-auto">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px]">
                      <span className="font-bold text-slate-400">Response</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded ${
                          result.status >= 200 && result.status < 300
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        Status: {result.status}
                      </span>
                    </div>
                    <pre className="text-slate-300 max-h-60 overflow-y-auto">
                      {JSON.stringify(result.data || result.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
