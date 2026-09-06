'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EntityService } from '@/lib/entityService';

export default function OfficialLegacyDetailsRedirect() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id || '');

  useEffect(() => {
    const officials = EntityService.getAllOfficials();
    const index = parseInt(id, 10);
    let targetSlug = 'anthony-taylor';

    if (!isNaN(index) && officials[index % officials.length]) {
      targetSlug = officials[index % officials.length].slug;
    } else {
      const match = officials.find(
        (o) => o.slug === id.toLowerCase() || o.name.toLowerCase().includes(id.toLowerCase())
      );
      if (match) targetSlug = match.slug;
    }

    router.replace(`/football/officials/${targetSlug}`);
  }, [id, router]);

  return (
    <div className="min-h-screen bg-[#070A1A] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
