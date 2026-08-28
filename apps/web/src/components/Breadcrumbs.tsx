'use client';

import Link from 'next/link';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import { EntityBreadcrumbItem } from '@goalmills/types';
import { generateBreadcrumbSchema } from '@/lib/seo/schemaGenerator';

interface BreadcrumbsProps {
  items: EntityBreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const fullItems: EntityBreadcrumbItem[] = [{ name: 'Home', url: '/' }, ...items];
  const schemaJson = generateBreadcrumbSchema(fullItems);

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-xs sm:text-sm text-slate-400 overflow-x-auto no-scrollbar py-2 ${className}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />
      <ol className="flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap">
        {fullItems.map((item, index) => {
          const isLast = index === fullItems.length - 1;
          return (
            <li key={item.url + index} className="flex items-center space-x-1.5 sm:space-x-2">
              {index > 0 && <FiChevronRight className="text-slate-600 flex-shrink-0" size={13} />}
              {isLast ? (
                <span
                  className="font-bold text-white max-w-[200px] sm:max-w-[320px] truncate"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1 font-medium text-slate-300"
                >
                  {index === 0 && <FiHome size={13} className="text-blue-400" />}
                  <span>{item.name}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
