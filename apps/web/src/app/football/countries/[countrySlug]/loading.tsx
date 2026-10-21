import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function CountryLoading() {
  return (
    <div className="min-h-screen bg-[#070A1A] flex items-center justify-center p-6">
      <GoalmillsLoader
        size="lg"
        label="GoalMills Country Hub"
        sublabel="Loading national football pyramid, domestic leagues & priority clubs..."
      />
    </div>
  );
}
