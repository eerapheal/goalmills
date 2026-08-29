import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GoalmillsLoader, GoalmillsCardSkeleton } from '../GoalmillsLoader';

describe('GoalmillsLoader Component', () => {
  it('renders default loader with brand labels', () => {
    render(<GoalmillsLoader />);
    expect(screen.getByText('GoalMills Live')).toBeInTheDocument();
    expect(screen.getByText('Syncing real-time sports intelligence...')).toBeInTheDocument();
    expect(screen.getByText('GM')).toBeInTheDocument();
  });

  it('renders custom label and sublabel', () => {
    render(<GoalmillsLoader label="Loading Scores" sublabel="Fetching match status" size="lg" />);
    expect(screen.getByText('Loading Scores')).toBeInTheDocument();
    expect(screen.getByText('Fetching match status')).toBeInTheDocument();
  });

  it('renders inline small loader', () => {
    render(<GoalmillsLoader size="sm" label="Updating..." />);
    expect(screen.getByText('Updating...')).toBeInTheDocument();
  });

  it('renders skeleton cards with correct count', () => {
    const { container } = render(<GoalmillsCardSkeleton count={4} />);
    const cards = container.querySelectorAll('.rounded-2xl');
    expect(cards.length).toBe(4);
  });
});
