// Utility functions for video highlights & replays (usable on both Server and Client)

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  try {
    const trimmed = url.trim();
    if (trimmed.includes('youtube.com/embed/')) {
      return trimmed.split('embed/')[1].split('?')[0].split('/')[0];
    }
    if (trimmed.includes('youtube.com/shorts/')) {
      return trimmed.split('shorts/')[1].split('?')[0].split('/')[0];
    }
    if (trimmed.includes('youtu.be/')) {
      return trimmed.split('youtu.be/')[1].split('?')[0].split('/')[0];
    }
    if (trimmed.includes('youtube.com/watch')) {
      const parsed = new URL(trimmed);
      return parsed.searchParams.get('v');
    }
    const regex =
      /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = trimmed.match(regex);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}

export function getHighlightThumbnail(url: string, thumbnail?: string): string {
  if (thumbnail && thumbnail.trim()) return thumbnail;
  try {
    const ytId = extractYouTubeId(url);
    if (ytId) {
      return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }
  } catch (e) {
    // fallback
  }
  return `https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80`;
}

export const HIGHLIGHT_CATEGORIES = [
  'All',
  'Football',
  'Premier League',
  'Champions League',
  'La Liga',
  'Basketball',
  'Cricket',
  'Top Goals',
  'Tactical',
];
