import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function CoachesIndexLoading() {
  return (
    <div className="min-h-screen bg-[#070A1A] flex items-center justify-center p-6">
      <GoalmillsLoader
        size="lg"
        label="GoalMills Coaches Hub"
        sublabel="Loading tactical setups, managerial records & silverware achievements..."
      />
    </div>
  );
}
