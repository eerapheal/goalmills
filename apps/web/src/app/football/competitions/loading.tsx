import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function CompetitionsDirectoryLoading() {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <GoalmillsLoader
        size="lg"
        label="GoalMills Competitions"
        sublabel="Loading 75+ global and African football leagues..."
      />
    </div>
  );
}
