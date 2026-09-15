import { ReactNode } from 'react';

interface FootballDashboardPanelProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * Shared surface for the football dashboard rails. Keeping borders, heading
 * hierarchy and shadows in one place prevents side modules from drifting.
 */
export function FootballDashboardPanel({
  title,
  children,
  action,
  className = '',
}: FootballDashboardPanelProps) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-slate-800 bg-[#0f172a] shadow-[0_12px_32px_rgba(2,6,23,.22)] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <h2 className="text-[10px] font-black uppercase tracking-[.16em] text-slate-300">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
