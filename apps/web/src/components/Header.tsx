'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

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

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    { name: 'News', href: '/news' },
    { name: 'Highlight', href: '/highlights' },
  ];

  if (!mounted) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b ${scrolled
        ? 'bg-slate-950/80 backdrop-blur-xl border-slate-800 py-3 shadow-lg shadow-blue-900/10'
        : 'bg-transparent border-transparent py-6'
        }`}
    >
      <nav className="container mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group relative z-50">
          <div className="relative w-15 h-15 overflow-hidden rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[2px] shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105">
            <div className="bg-slate-950 rounded-[10px] w-full h-full flex items-center justify-center overflow-hidden">
              {/* Using the icon.png as requested */}
              <Image
                src="/icon.png"
                alt="GoalMills Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">GOAL</span>
            <span className="text-white">MILLS</span>
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative group py-2"
              >
                <span className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-blue-400' : 'text-slate-300 group-hover:text-white'}`}>
                  {item.name}
                </span>
                {/* Animated Underline */}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-cyan-400 transform origin-left transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />

                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 -z-10 rounded-lg blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100`} />
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden relative z-50 p-2 text-slate-300 hover:text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-6 h-6 flex flex-col justify-center items-end gap-1.5">
            <span className={`block h-0.5 bg-current transition-all duration-300 ${isOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`} />
            <span className={`block h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0 scale-0' : 'w-4'}`} />
            <span className={`block h-0.5 bg-current transition-all duration-300 ${isOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-5'}`} />
          </div>
        </button>

        {/* Mobile Navigation Drawer */}
        <div
          className={`fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-40 flex flex-col items-center justify-center transition-all duration-500 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto clip-circle-full' : 'opacity-0 pointer-events-none'
            }`}
          style={{
            // Using CSS variable for dynamic effect if needed, but opacity/pointer-events is good for fallback
          }}
        >
          <div className="flex flex-col gap-8 text-center">
            {navItems.map((item, idx) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-300 to-slate-500 hover:from-blue-400 hover:to-cyan-400 transition-all duration-300 transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="absolute bottom-12 text-slate-500 text-sm">
            © 2025 GoalMills
          </div>
        </div>
      </nav>
    </header>
  );
}
