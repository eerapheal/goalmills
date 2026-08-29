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
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    { name: 'Live Scores', href: '/' },
    { name: 'Football', href: '/football' },
    { name: 'Cricket', href: '/cricket' },
    { name: 'Basketball', href: '/basketball' },
    { name: 'News', href: '/news' },
    { name: 'Highlights', href: '/highlights' },
    { name: 'Tables', href: '/stats' },
  ];

  if (!mounted) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-3 sm:px-6 py-3">
      <div className="max-w-[1400px] mx-auto">
        <nav className="rounded-2xl border border-amber-400/40 bg-[#0C1726]/95 backdrop-blur-xl px-4 sm:px-6 py-3 shadow-[0_0_25px_rgba(245,158,11,0.15)] flex items-center justify-between">
          {/* Brand Logo & Subtitle */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-blue-400 p-[2px] shadow-lg shadow-amber-500/20 group-hover:scale-105 transition duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden">
                <Image
                  src="/icon.png"
                  alt="GoalMills Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <h1 className="text-xl font-black italic tracking-tight text-white flex items-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">
                  GOAL
                </span>
                <span className="text-white ml-0.5">MILLS</span>
              </h1>
              <p className="text-[10px] font-semibold text-amber-400 tracking-wider uppercase">
                Sports Intelligence Platform
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 relative ${
                    isActive
                      ? 'text-amber-400 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.2)] border border-amber-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-3 right-3 h-[2px] bg-amber-400 rounded-full shadow-[0_0_8px_#fbbf24]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons: Search, Alerts, Docs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/news"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition hover:border-amber-500/30"
            >
              <FiSearch className="w-3.5 h-3.5 text-amber-400" />
              <span>Search</span>
            </Link>

            <NotificationBell />

            <Link
              href="/docs"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition hover:border-amber-500/30"
            >
              <FiActivity className="w-3.5 h-3.5 text-orange-400" />
              <span>Docs</span>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <NotificationBell />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="lg:hidden mt-2 p-4 rounded-2xl bg-[#0C1726]/95 border border-amber-400/30 shadow-2xl backdrop-blur-xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-2.5 rounded-xl text-sm font-bold text-slate-200 hover:bg-amber-500/10 hover:text-amber-400 transition"
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
