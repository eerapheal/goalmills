'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EntityService } from '@/lib/entityService';

export default function CoachLegacyDetailsRedirect() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id || '');

  useEffect(() => {
    const coaches = EntityService.getAllCoaches();
    const index = parseInt(id, 10);
    let targetSlug = 'pep-guardiola';

    if (!isNaN(index) && coaches[index % coaches.length]) {
      targetSlug = coaches[index % coaches.length].slug;
    } else {
      const match = coaches.find(
        (c) => c.slug === id.toLowerCase() || c.name.toLowerCase().includes(id.toLowerCase())
      );
      if (match) targetSlug = match.slug;
    }

    router.replace(`/football/coaches/${targetSlug}`);
  }, [id, router]);

  return (
    <div className="min-h-screen bg-[#070A1A] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
