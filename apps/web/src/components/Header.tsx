'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { NotificationBell } from './NotificationBell';
import { FiSearch, FiMenu, FiX, FiActivity } from 'react-icons/fi';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    { name: 'Live Scores', href: '/' },
    { name: 'Football', href: '/football' },
    { name: 'Players', href: '/football/players' },
    { name: 'Cricket', href: '/cricket' },
    { name: 'Basketball', href: '/basketball' },
    { name: 'News', href: '/news' },
    { name: 'Highlights', href: '/highlights' },
    { name: 'Tables', href: '/stats' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-3 sm:px-6 py-2 ${scrolled ? 'bg-slate-950/80 backdrop-blur-md shadow-md' : ''}`}>
      <div className="max-w-[1400px] mx-auto">
        <nav className="rounded-xl border border-blue-500/30 bg-[#0C1726]/95 backdrop-blur-xl px-3 sm:px-4 py-2 shadow-lg flex items-center justify-between">
          {/* Brand Logo & Subtitle */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 p-[1.5px] shadow-md shadow-blue-500/20 group-hover:scale-105 transition duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center overflow-hidden">
                <Image
                  src="/icon.png"
                  alt="GoalMills Logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <h1 className="text-base sm:text-lg font-black italic tracking-tight text-white flex items-center leading-none">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                  GOAL
                </span>
                <span className="text-white ml-0.5">MILLS</span>
              </h1>
              <p className="text-[9px] font-bold tracking-wider uppercase mt-0.5 flex items-center gap-1">
                <span className="text-amber-400 font-black">Africa</span>
                <span className="text-slate-500">•</span>
                <span className="text-blue-300">Live Football 2026/2027</span>
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Pills */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 relative ${
                    isActive
                      ? 'text-blue-400 bg-blue-500/15 shadow-sm border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons: Search, Alerts, Docs */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/news"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition hover:border-blue-500/30"
            >
              <FiSearch className="w-3 h-3 text-blue-400" />
              <span>Search</span>
            </Link>

            <NotificationBell />

            <Link
              href="/docs"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition hover:border-blue-500/30"
            >
              <FiActivity className="w-3 h-3 text-blue-400" />
              <span>Docs</span>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <NotificationBell />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <FiX className="w-4 h-4" /> : <FiMenu className="w-4 h-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="lg:hidden mt-1.5 p-3 rounded-2xl bg-[#091529]/98 border border-blue-400/30 shadow-2xl backdrop-blur-2xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Quick Links Grid */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { name: 'Live Scores', href: '/', icon: '🔴' },
                { name: 'Football Hub', href: '/football', icon: '⚽' },
                { name: 'Players', href: '/football/players', icon: '⭐' },
                { name: 'Referees & VAR', href: '/football/officials', icon: '🚩' },
                { name: 'Managers', href: '/football/coaches', icon: '🧑‍💼' },
                { name: 'Teams & Clubs', href: '/football/teams', icon: '🛡️' },
                { name: 'Cricket Desk', href: '/cricket', icon: '🏏' },
                { name: 'Basketball Hub', href: '/basketball', icon: '🏀' },
                { name: 'News & Pulse', href: '/news', icon: '📰' },
                { name: 'Video Highlights', href: '/highlights', icon: '🎥' },
                { name: 'Tables & Stats', href: '/stats', icon: '🏆' },
                { name: 'VIP Newsletter', href: '/newsletter', icon: '📬' },
              ].map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-black shadow-sm'
                        : 'bg-[#0E1F38] text-slate-200 hover:text-white hover:bg-blue-600/20 border border-blue-500/15'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-1.5 border-t border-white/10 flex items-center justify-between gap-2">
              <Link
                href="/news"
                onClick={() => setIsOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 hover:text-white"
              >
                <FiSearch className="text-blue-400" />
                <span>Search News & Matches</span>
              </Link>
              <Link
                href="/docs"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1"
              >
                <FiActivity className="text-blue-400" />
                <span>Docs</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
