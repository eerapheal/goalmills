import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function TeamsIndexLoading() {
  return (
    <div className="min-h-screen bg-[#070A1A] flex items-center justify-center p-6">
      <GoalmillsLoader
        size="lg"
        label="GoalMills Clubs Directory"
        sublabel="Loading elite football clubs, squads, stadiums & managers..."
      />
    </div>
  );
}
