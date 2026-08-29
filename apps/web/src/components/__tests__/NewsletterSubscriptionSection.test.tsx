import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewsletterSubscriptionSection } from '../NewsletterSubscriptionSection';

describe('NewsletterSubscriptionSection', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders headline, topic pills, and frequency options', () => {
    render(<NewsletterSubscriptionSection />);

    expect(screen.getByText(/GoalMills Sports Intelligence Dispatch/i)).toBeInTheDocument();
    expect(screen.getByText(/Curated Match Intel & Analytics/i)).toBeInTheDocument();
    expect(screen.getByText('Football')).toBeInTheDocument();
    expect(screen.getByText('Basketball (NBA)')).toBeInTheDocument();
    expect(screen.getByText('Cricket')).toBeInTheDocument();
    expect(screen.getByText('Daily Morning Intel')).toBeInTheDocument();
  });

  it('allows toggling sport topic preferences', () => {
    render(<NewsletterSubscriptionSection />);

    const basketballBtn = screen.getByText('Basketball (NBA)').closest('button');
    expect(basketballBtn).toBeInTheDocument();
    fireEvent.click(basketballBtn!);

    // Should update selected count
    expect(screen.getByText(/selected/i)).toBeInTheDocument();
  });

  it('submits subscription and displays success state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Thank you for subscribing to GoalMills Newsletters!',
      }),
    });

    render(<NewsletterSubscriptionSection />);

    const input = screen.getByPlaceholderText(/e\.g\. alex\.ferguson@sportsmedia\.com/i);
    const submitBtn = screen.getByRole('button', { name: /Get Sports Intel Free/i });

    fireEvent.change(input, { target: { value: 'fan@goalmills.com' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/You're On the VIP List!/i)).toBeInTheDocument();
    });

    expect(screen.getByText('fan@goalmills.com')).toBeInTheDocument();
  });

  it('handles deliverability typo suggestions', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        hasTypo: true,
        suggestedCorrection: 'fan@gmail.com',
        message: 'Did you mean fan@gmail.com?',
      }),
    });

    render(<NewsletterSubscriptionSection />);

    const input = screen.getByPlaceholderText(/e\.g\. alex\.ferguson@sportsmedia\.com/i);
    const submitBtn = screen.getByRole('button', { name: /Get Sports Intel Free/i });

    fireEvent.change(input, { target: { value: 'fan@gmai.com' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/fan@gmail\.com/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Use Suggestion/i })).toBeInTheDocument();
    });
  });
});
