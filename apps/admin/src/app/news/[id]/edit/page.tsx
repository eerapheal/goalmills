'use client';

import { useParams } from 'next/navigation';
import EditNewsForm from '@/components/admin/EditNewsForm';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function EditNewsPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      <EditNewsForm id={id} />
    </div>
  );
}
