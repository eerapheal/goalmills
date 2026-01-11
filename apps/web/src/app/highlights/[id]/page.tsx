import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Video from '@/models/Video';
import VideoPlayer from '@/components/VideoPlayer';

// Function to generate metadata
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await dbConnect();

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return { title: 'Video Not Found' };
    }

    const video = await Video.findById(id).select('video_title').lean();
    if (!video) return { title: 'Video Not Found' };

    return {
        title: `${video.video_title} | GoalMills Results`,
        description: `Watch highlights for ${video.video_title} on GoalMills.`,
    };
}

export default async function HighlightDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        notFound();
    }

    await dbConnect();
    const video = await Video.findById(id).lean();

    if (!video) {
        notFound();
    }

    // Prepare video object
    const videoData = {
        ...video,
        _id: video._id.toString(),
        createdAt: video.createdAt ? new Date(video.createdAt as Date | string).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : '',
    };

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <Link href="/highlights" className="text-blue-400 hover:text-blue-300 mb-6 inline-flex items-center gap-2 font-medium transition-colors">
                    <span>&larr;</span> Back to Highlights
                </Link>

                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden p-6 md:p-8 shadow-2xl">
                    <div className="mb-6">
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
                            {videoData.video_title}
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Uploaded on {videoData.createdAt}
                        </p>
                    </div>

                    <div className="w-full">
                        <VideoPlayer
                            url={videoData.video_url}
                            thumbnail={videoData.video_thumbnail}
                            autoPlay={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
