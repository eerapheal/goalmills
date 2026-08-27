'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiClock, FiArrowRight, FiZap } from 'react-icons/fi';
import { BlogPost } from '@goalmills/types';

interface RelatedArticlesMatrixProps {
  title?: string;
  subtitle?: string;
  articles: BlogPost[];
  className?: string;
}

export function RelatedArticlesMatrix({
  title = 'Related Content & Intelligence',
  subtitle = 'Contextual stories, analysis, and updates',
  articles,
  className = '',
}: RelatedArticlesMatrixProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section
      className={`rounded-3xl border border-white/10 bg-gradient-to-b from-[#0e1628]/80 to-[#070b14]/90 p-5 sm:p-7 shadow-2xl backdrop-blur-md ${className}`}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600/30 text-blue-400 text-sm">
              <FiZap />
            </span>
            <span>{title}</span>
          </h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
          Curated Hub
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {articles.map((item) => {
          const articleId = item._id;
          const articleUrl = item.slug ? `/news/${item.slug}` : `/news/${articleId}`;

          return (
            <Link
              key={articleId}
              href={articleUrl}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] p-4 transition-all duration-300 hover:border-blue-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div>
                {/* Article Cover Image */}
                {item.image && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950 mb-3.5">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 350px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.isBreaking && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-red-600 text-white shadow-lg">
                        Breaking
                      </span>
                    )}
                  </div>
                )}

                {/* Meta info */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 truncate">
                    {item.category || item.competition || 'Sports'}
                  </span>
                  <span className="text-[10px] text-slate-500">•</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <FiClock size={10} /> {item.readTime || 3} min
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h4>

                {/* Excerpt */}
                {item.excerpt && (
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {item.excerpt}
                  </p>
                )}
              </div>

              {/* Action link footer */}
              <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
                <span>Read Story</span>
                <FiArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
