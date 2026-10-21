import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function PlayersIndexLoading() {
  return (
    <div className="min-h-screen bg-[#070A1A] flex items-center justify-center p-6">
      <GoalmillsLoader
        size="lg"
        label="GoalMills Players Hub"
        sublabel="Loading player market valuations, contract data & scouting metrics..."
      />
    </div>
  );
}
