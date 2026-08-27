import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoCard } from '../VideoCard';

const mockVideo: any = {
  id: 'vid-123',
  title: 'Real Madrid vs Barcelona El Clasico Highlights',
  thumbnail: 'https://example.com/thumb.jpg',
  duration: '12:45',
  views: 85000,
  league: { name: 'La Liga' },
  date: '2026-08-26',
};

describe('VideoCard Component', () => {
  it('renders video title, duration, views and league', () => {
    render(<VideoCard video={mockVideo} />);
    expect(screen.getByText('Real Madrid vs Barcelona El Clasico Highlights')).toBeInTheDocument();
    expect(screen.getByText('12:45')).toBeInTheDocument();
    expect(screen.getByText('85.0K views')).toBeInTheDocument();
    expect(screen.getByText('La Liga')).toBeInTheDocument();
  });

  it('triggers onPress callback when clicked', () => {
    const onPressMock = vi.fn();
    render(<VideoCard video={mockVideo} onPress={onPressMock} />);

    fireEvent.click(screen.getByText('Real Madrid vs Barcelona El Clasico Highlights'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
