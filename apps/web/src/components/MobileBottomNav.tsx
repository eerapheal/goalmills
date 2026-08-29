'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiRadio, FiActivity, FiGlobe, FiTv, FiBarChart2, FiMail } from 'react-icons/fi';

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Live',
      href: '/',
      icon: <FiRadio className="w-4 h-4" />,
      exact: true,
      badge: 'LIVE',
    },
    {
      name: 'Football',
      href: '/football',
      icon: <span className="text-sm">⚽</span>,
    },
    {
      name: 'Cricket',
      href: '/cricket',
      icon: <span className="text-sm">🏏</span>,
    },
    {
      name: 'Hoops',
      href: '/basketball',
      icon: <span className="text-sm">🏀</span>,
    },
    {
      name: 'News',
      href: '/news',
      icon: <FiGlobe className="w-4 h-4" />,
    },
    {
      name: 'Tables',
      href: '/stats',
      icon: <FiBarChart2 className="w-4 h-4" />,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pt-1 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="grid grid-cols-6 items-center p-1.5 rounded-2xl bg-[#091529]/95 border border-amber-500/30 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.15)]">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-b from-amber-500/20 to-orange-500/10 text-amber-300 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 active:scale-95'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  {item.icon}
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                  )}
                </div>

                <span
                  className={`text-[9px] font-black tracking-tight mt-0.5 ${
                    isActive ? 'text-amber-300 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  {item.name}
                </span>

                {isActive && (
                  <span className="absolute -bottom-0.5 w-4 h-[2px] bg-amber-400 rounded-full shadow-[0_0_6px_#fbbf24]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
