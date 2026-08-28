'use client';

import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <GoalmillsLoader
        size="fullscreen"
        label="GoalMills EMS"
        sublabel="Loading newsroom operations & staff intelligence..."
      />
    </div>
  );
}
