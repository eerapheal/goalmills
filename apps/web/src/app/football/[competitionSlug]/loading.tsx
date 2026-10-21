import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function CompetitionLoading() {
  return (
    <div className="min-h-screen bg-[#070A1A] flex items-center justify-center p-6">
      <GoalmillsLoader
        size="lg"
        label="GoalMills Competition Hub"
        sublabel="Loading competition table, fixtures, stats & team intelligence..."
      />
    </div>
  );
}
