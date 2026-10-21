import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function ConfederationLoading() {
  return (
    <div className="min-h-screen bg-[#070A1A] flex items-center justify-center p-6">
      <GoalmillsLoader
        size="lg"
        label="GoalMills Confederation Hub"
        sublabel="Loading continental championships, tournaments & member confederation standings..."
      />
    </div>
  );
}
