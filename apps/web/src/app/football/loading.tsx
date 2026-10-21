import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function FootballLoading() {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <GoalmillsLoader
        size="lg"
        label="GoalMills Football"
        sublabel="Connecting to real-time scores, standings & football telemetry..."
      />
    </div>
  );
}
