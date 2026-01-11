import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Video from '@/models/Video';
import VideoPlayer from '@/components/VideoPlayer';
import { ShareButtons } from '@/components/ShareButtons';

// Function to generate metadata
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await dbConnect();

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return { title: 'Video Not Found' };
    }

    const video = await Video.findById(id).select('video_title video_url video_thumbnail category createdAt source').lean();
    if (!video) return { title: 'Video Not Found' };

    const title = `${video.video_title} | GoalMills Highlights`;
    const description = `Watch ${video.video_title} highlights on GoalMills. Catch all the action and key moments from this exciting match.`;
    const thumbnailUrl = video.video_thumbnail || `https://picsum.photos/seed/video${id}/1200/630`;
    const url = `https://goalmills.com/highlights/${id}`;
    const publishedTime = video.createdAt ? new Date(video.createdAt as Date | string).toISOString() : new Date().toISOString();

    return {
        title,
        description,
        keywords: `${video.category || 'football'}, ${video.video_title}, match highlights, sports videos, GoalMills`,
        publisher: 'GoalMills',

        // Open Graph for Video
        openGraph: {
            type: 'video.other',
            title,
            description,
            url,
            siteName: 'GoalMills',
            images: [
                {
                    url: thumbnailUrl,
                    width: 1200,
                    height: 630,
                    alt: video.video_title as string,
                },
            ],
            videos: [
                {
                    url: video.video_url as string,
                    secureUrl: video.video_url as string,
                    type: 'video/mp4',
                    width: 1280,
                    height: 720,
                },
            ],
            locale: 'en_US',
            publishedTime,
        },

        // Twitter Card for Video
        twitter: {
            card: 'player',
            title,
            description,
            images: [thumbnailUrl],
            players: [
                {
                    playerUrl: url,
                    streamUrl: video.video_url as string,
                    width: 1280,
                    height: 720,
                },
            ],
            site: '@goalmills',
        },

        // Additional metadata
        alternates: {
            canonical: url,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
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
        <div className="min-h-full bg-slate-950 px-2 md:px-8 pt-[95px] pb-12">
            <div className="max-w-9xl mx-auto">
                <Link href="/highlights" className="text-blue-400 hover:text-blue-300 mb-6 inline-flex items-center gap-2 font-medium transition-colors">
                    <span>&larr;</span> Back to Highlights
                </Link>

                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden p-2 md:p-8 shadow-2xl">


                    <div className="w-full md:max-w-7xl md:mx-auto">
                        <VideoPlayer
                            url={videoData.video_url}
                            thumbnail={videoData.video_thumbnail}
                            autoPlay={true}
                            className="aspect-[4/3] md:aspect-video"
                        />
                    </div>
                    <div className="mt-6 md:mt-10">
                        <h1 className="text-lg md:text-3xl font-black text-white mb-2 leading-tight">
                            {videoData.video_title}
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Uploaded on {videoData.createdAt} {videoData.source && <span className="ml-2">• Source: {videoData.source}</span>}
                        </p>
                        <div className="mt-4 border-t border-slate-800 pt-4">
                            <ShareButtons
                                url={`https://goalmills-web.vercel.app/highlights/${id}`}
                                title={videoData.video_title}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
