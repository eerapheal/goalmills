import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FixtureCard } from '../FixtureCard';

const mockFixture: any = {
  fixture: {
    id: 101,
    date: '2026-08-26T20:00:00Z',
    status: { short: '1H', elapsed: 35, long: 'First Half' },
  },
  league: {
    id: 39,
    name: 'Premier League',
    logo: 'https://example.com/epl.png',
  },
  teams: {
    home: { id: 42, name: 'Arsenal', logo: 'https://example.com/arsenal.png' },
    away: { id: 49, name: 'Chelsea', logo: 'https://example.com/chelsea.png' },
  },
  goals: { home: 2, away: 1 },
  score: { halftime: { home: 2, away: 1 }, fulltime: { home: null, away: null } },
};

describe('FixtureCard Component', () => {
  it('renders team names and league info', () => {
    render(<FixtureCard fixture={mockFixture} />);
    expect(screen.getByText('Arsenal')).toBeInTheDocument();
    expect(screen.getByText('Chelsea')).toBeInTheDocument();
    expect(screen.getByText('Premier League')).toBeInTheDocument();
  });

  it('renders live scores for active match', () => {
    render(<FixtureCard fixture={mockFixture} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calls custom onPress handler when clicked', () => {
    const onPressMock = vi.fn();
    const { container } = render(<FixtureCard fixture={mockFixture} onPress={onPressMock} />);

    fireEvent.click(container.firstChild as HTMLElement);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
