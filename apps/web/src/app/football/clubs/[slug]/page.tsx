import { redirect } from 'next/navigation';

interface ClubPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ClubPage({ params }: ClubPageProps) {
  const { slug } = await params;
  redirect(`/football/teams/${slug}`);
}
