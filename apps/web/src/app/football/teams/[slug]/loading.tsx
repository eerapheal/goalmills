import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function TeamLoading() {
  return (
    <div className="min-h-screen bg-[#070A1A] flex items-center justify-center p-6">
      <GoalmillsLoader
        size="lg"
        label="GoalMills Football"
        sublabel="Syncing squad, fixtures & team performance..."
      />
    </div>
  );
}
