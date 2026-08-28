import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CricketMatchCard } from '../CricketMatchCard';
import { CricketEvent } from '@goalmills/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockMatch: CricketEvent = {
  event_key: 'crick-101',
  event_date_start: '2026-09-05',
  event_date_stop: '2026-09-05',
  event_time: '14:30',
  event_home_team: 'India',
  home_team_key: '1',
  event_away_team: 'Australia',
  away_team_key: '2',
  event_service_home: '1',
  event_service_away: '2',
  event_home_final_result: '280/6 (50.0)',
  event_away_final_result: '275/9 (50.0)',
  event_status: 'Finished',
  event_status_info: 'India won by 5 runs',
  country_name: 'International',
  league_name: 'ICC Cricket World Cup',
  league_key: '9843',
  event_live: '0',
  event_type: 'ODI',
  event_tier: 'international',
};

describe('CricketMatchCard Component', () => {
  it('renders match teams, league, and status accurately', () => {
    render(<CricketMatchCard match={mockMatch} />);

    expect(screen.getByText('India')).toBeInTheDocument();
    expect(screen.getByText('Australia')).toBeInTheDocument();
    expect(screen.getByText('280/6 (50.0)')).toBeInTheDocument();
    expect(screen.getByText('275/9 (50.0)')).toBeInTheDocument();
    expect(screen.getByText('India won by 5 runs')).toBeInTheDocument();
    expect(screen.getByText('ICC Cricket World Cup')).toBeInTheDocument();
  });
});
