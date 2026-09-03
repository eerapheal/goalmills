import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Metadata } from 'next';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { EntityService } from '@/lib/entityService';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { RelatedArticlesMatrix } from '@/components/RelatedArticlesMatrix';
import { FiFeather, FiCheckCircle, FiTwitter, FiLinkedin, FiShield, FiClock, FiAward } from 'react-icons/fi';
import { BlogPost } from '@goalmills/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = EntityService.getAuthor(slug);
  if (!author) return { title: 'Author Profile | GoalMills' };

  return {
    title: `${author.name} — Sports Journalist & Intelligence Analyst | GoalMills`,
    description: `Read all sports journalism, tactical breakdowns, and transfer intelligence authored by ${author.name} on GoalMills.`,
  };
}

export default async function AuthorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = EntityService.getAuthor(slug);

  if (!author) {
    notFound();
  }

  let authoredArticles: BlogPost[] = [];
  let trainingStatus: { isTrainee: boolean; isCertified: boolean; completedDays: number } | null = null;

  try {
    await dbConnect();
    const [articlesDocs, db] = await Promise.all([
      News.find({
        $or: [
          { authorSlug: author.slug },
          { author: { $regex: new RegExp(author.name.split(' ')[0], 'i') } },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),
      import('mongoose').then((m) => m.default.connection.db),
    ]);

    authoredArticles = JSON.parse(JSON.stringify(articlesDocs));

    if (db) {
      const emp = await db.collection('employees').findOne({
        $or: [
          { fullName: { $regex: new RegExp(`^${author.name.trim()}$`, 'i') } },
          { email: { $regex: new RegExp(author.slug, 'i') } },
        ],
      });

      if (emp) {
        const tp = await db.collection('trainingprogresses').findOne({
          employeeId: emp._id,
        });
        const completedDays = tp?.completedDays?.length || tp?.completedDaysCount || 0;
        const isCertified = tp?.isCertified || (completedDays >= 30 && emp.status !== 'training');
        trainingStatus = {
          isTrainee: !isCertified,
          isCertified,
          completedDays,
        };
      }
    }
  } catch (err) {
    console.error('Error loading author profile data:', err);
  }

  return (
    <ContentHubLayout
      breadcrumbs={[
        { name: 'Editorial', url: '/about' },
        { name: author.name, url: `/authors/${author.slug}` },
      ]}
      header={
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0c1830] via-[#091224] to-[#050b16] p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-3xl overflow-hidden bg-slate-900 border-2 border-blue-500/40 shadow-xl flex-shrink-0">
              <Image src={author.photo} alt={author.name} fill className="object-cover" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {trainingStatus?.isCertified ? (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <FiAward size={12} />
                    GoalMills Certified Sports Media Specialist
                  </span>
                ) : trainingStatus?.isTrainee ? (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                    <FiClock size={12} />
                    On Training ({trainingStatus.completedDays}/30 Days)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                    <FiCheckCircle size={12} />
                    Verified Journalist
                  </span>
                )}
                <span className="text-xs text-slate-400 font-bold uppercase">• {author.role}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white">{author.name}</h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {author.bio}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {author.specialization.map((spec) => (
                  <span
                    key={spec}
                    className="px-2.5 py-1 rounded-xl bg-white/[0.04] text-slate-300 text-xs font-semibold border border-white/10"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    >
      {authoredArticles.length > 0 ? (
        <RelatedArticlesMatrix
          title={`Published Works by ${author.name}`}
          subtitle="Exclusive stories, investigative scoops, and tactical debriefs"
          articles={authoredArticles}
        />
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center text-slate-400">
          <p className="text-sm">No published articles under this byline yet.</p>
        </div>
      )}
    </ContentHubLayout>
  );
}
