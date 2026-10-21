import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function PlayerLoading() {
  return (
    <div className="min-h-screen bg-[#070A1A] flex items-center justify-center p-6">
      <GoalmillsLoader
        size="lg"
        label="GoalMills Player Hub"
        sublabel="Loading player performance, stats & match history..."
      />
    </div>
  );
}
