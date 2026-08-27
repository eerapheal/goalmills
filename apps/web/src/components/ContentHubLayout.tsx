'use client';

import { ReactNode } from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { EntityBreadcrumbItem } from '@goalmills/types';

interface ContentHubLayoutProps {
  breadcrumbs: EntityBreadcrumbItem[];
  header?: ReactNode;
  children: ReactNode;
  sidebar?: ReactNode;
  className?: string;
}

export function ContentHubLayout({
  breadcrumbs,
  header,
  children,
  sidebar,
  className = '',
}: ContentHubLayoutProps) {
  return (
    <main className={`min-h-screen bg-[#070B12] text-white pt-[95px] sm:pt-[105px] pb-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-4 sm:mb-6">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Optional Header Banner */}
        {header && <div className="mb-8">{header}</div>}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Main Content Area */}
          <div className={sidebar ? 'lg:col-span-8 space-y-8' : 'lg:col-span-12 space-y-8'}>
            {children}
          </div>

          {/* Sticky Sidebar */}
          {sidebar && (
            <aside className="lg:col-span-4 space-y-6">
              <div className="sticky top-24 space-y-6">{sidebar}</div>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
