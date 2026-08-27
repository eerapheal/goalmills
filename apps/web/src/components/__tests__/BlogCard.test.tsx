import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlogCard } from '../BlogCard';

const mockPost: any = {
  id: 'blog-1',
  title: 'Tactical Revolution: Modern Pressing in Elite Football',
  excerpt: 'How high pressing shaped modern European football tactics.',
  category: 'Tactics',
  author: 'Tactics Analyst',
  readTime: 5,
  createdAt: '2026-08-26T10:00:00Z',
};

describe('BlogCard Component', () => {
  it('renders title, category, author and reading time', () => {
    render(<BlogCard post={mockPost} />);
    expect(
      screen.getByText('Tactical Revolution: Modern Pressing in Elite Football')
    ).toBeInTheDocument();
    expect(screen.getByText('Tactics')).toBeInTheDocument();
    expect(screen.getByText('By Tactics Analyst')).toBeInTheDocument();
    expect(screen.getByText('5 min read')).toBeInTheDocument();
  });

  it('triggers onPress when clicked', () => {
    const onPressMock = vi.fn();
    render(<BlogCard post={mockPost} onPress={onPressMock} />);

    fireEvent.click(screen.getByText('Tactical Revolution: Modern Pressing in Elite Football'));
    expect(onPressMock).toHaveBeenCalled();
  });
});
