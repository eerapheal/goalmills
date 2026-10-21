import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function MatchLoading() {
  return (
    <div className="min-h-screen bg-[#070A1A] flex items-center justify-center p-6">
      <GoalmillsLoader
        size="lg"
        label="GoalMills Match Centre"
        sublabel="Loading live scores, lineups & match telemetry..."
      />
    </div>
  );
}
