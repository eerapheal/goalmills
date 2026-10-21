import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function CompetitionTableLoading() {
  return (
    <div className="min-h-screen bg-[#070A1A] flex items-center justify-center p-6">
      <GoalmillsLoader
        size="lg"
        label="GoalMills Standings"
        sublabel="Calculating points, goal difference, tiebreakers & live table..."
      />
    </div>
  );
}
