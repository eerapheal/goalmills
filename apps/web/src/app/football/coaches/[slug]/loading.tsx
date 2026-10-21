import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function CoachLoading() {
  return (
    <div className="min-h-screen bg-[#070A1A] flex items-center justify-center p-6">
      <GoalmillsLoader
        size="lg"
        label="GoalMills Manager Hub"
        sublabel="Loading managerial tactics, trophy record & history..."
      />
    </div>
  );
}
