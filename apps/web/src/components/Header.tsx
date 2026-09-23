'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { NotificationBell } from './NotificationBell';
import { FiSearch } from 'react-icons/fi';

const NAV_LINKS = [
  { label: 'Live Scores', href: '/' },
  { label: 'Football', href: '/football' },
  { label: 'Cricket', href: '/cricket' },
  { label: 'Basketball', href: '/basketball' },
  { label: 'News', href: '/news' },
  { label: 'Highlights', href: '/highlights' },
  { label: 'Tables', href: '/stats' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#020617]/95 backdrop-blur-md border-b border-[#1e293b]'
          : 'bg-[#020617]/80 backdrop-blur-sm border-b border-[#1e293b]/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <Image
              src="/icon.png"
              alt="GoalMills"
              width={115}
              height={32}
              priority
              style={{ width: 'auto', height: 'auto' }}
              className="h-7 w-auto object-contain transition-transform group-hover:scale-105 duration-200"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'text-white bg-[#1e293b] font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-[#1e293b]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Live CTA */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/news"
              className="p-2 text-slate-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-all"
              aria-label="Search articles"
            >
              <FiSearch className="w-4 h-4" />
            </Link>

            <NotificationBell />

            <Link
              href="/#scores"
              className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse" />
              Live
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-all"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0f172a] border-b border-[#1e293b] animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'text-white bg-[#1e293b] font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-[#1e293b]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-[#1e293b] mt-2">
              <Link
                href="/#scores"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse" />
                Live Scores & Fixtures
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
