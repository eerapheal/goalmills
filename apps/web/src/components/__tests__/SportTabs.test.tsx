import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SportTabs } from '../SportTabs';

describe('SportTabs Component', () => {
  it('renders all sport tabs (Football, Cricket, Tennis, Basketball, Baseball, Hockey)', () => {
    render(<SportTabs selectedSport="football" onSelectSport={vi.fn()} />);
    expect(screen.getByText('Football')).toBeInTheDocument();
    expect(screen.getByText('Cricket')).toBeInTheDocument();
    expect(screen.getByText('Tennis')).toBeInTheDocument();
    expect(screen.getByText('Basketball')).toBeInTheDocument();
    expect(screen.getByText('Baseball')).toBeInTheDocument();
    expect(screen.getByText('Hockey')).toBeInTheDocument();
  });

  it('triggers onSelectSport when another sport tab is clicked', () => {
    const onSelectMock = vi.fn();
    render(<SportTabs selectedSport="football" onSelectSport={onSelectMock} />);

    fireEvent.click(screen.getByText('Cricket'));
    expect(onSelectMock).toHaveBeenCalledWith('cricket');
  });
});
