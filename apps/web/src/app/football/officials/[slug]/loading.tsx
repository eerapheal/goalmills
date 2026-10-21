import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function OfficialLoading() {
  return (
    <div className="min-h-screen bg-[#070A1A] flex items-center justify-center p-6">
      <GoalmillsLoader
        size="lg"
        label="GoalMills Officiating Hub"
        sublabel="Loading match referee disciplinary logs, card indices & VAR analytics..."
      />
    </div>
  );
}
