import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#020617]">
      <GoalmillsLoader
        size="lg"
        label="GoalMills"
        sublabel="Connecting to live scores & sports intelligence..."
      />
    </div>
  );
}
