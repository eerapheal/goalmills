import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function OfficialsIndexLoading() {
  return (
    <div className="min-h-screen bg-[#070A1A] flex items-center justify-center p-6">
      <GoalmillsLoader
        size="lg"
        label="GoalMills Officials Directory"
        sublabel="Loading match referees, disciplinary indices & VAR tracking..."
      />
    </div>
  );
}
