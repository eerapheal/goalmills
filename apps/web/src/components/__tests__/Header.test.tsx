import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../Header';
import { ToastProvider } from '../Toast';

describe('Header Component', () => {
  it('renders brand logo and title', () => {
    render(
      <ToastProvider>
        <Header />
      </ToastProvider>
    );
    expect(screen.getByText('GOAL')).toBeInTheDocument();
    expect(screen.getByText('MILLS')).toBeInTheDocument();
  });

  it('renders navigation links (News & Highlights)', () => {
    render(
      <ToastProvider>
        <Header />
      </ToastProvider>
    );
    const newsLinks = screen.getAllByText('News');
    expect(newsLinks.length).toBeGreaterThan(0);
    const highlightLinks = screen.getAllByText('Highlights');
    expect(highlightLinks.length).toBeGreaterThan(0);
  });

  it('toggles mobile navigation drawer on hamburger button click', () => {
    render(
      <ToastProvider>
        <Header />
      </ToastProvider>
    );
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(toggleButton).toBeInTheDocument();
  });
});
