'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  FiUsers,
  FiFileText,
  FiAward,
  FiDollarSign,
  FiLayers,
  FiUserCheck,
  FiCalendar,
  FiCheckSquare,
  FiHome,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronDown,
} from 'react-icons/fi';

export default function AdminNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'News & Media', href: '/admin/dashboard', icon: FiFileText, group: 'editorial' },
    { label: 'Employees & Staff', href: '/admin/employees', icon: FiUsers, group: 'ems' },
    { label: 'Daily Reports', href: '/admin/reports', icon: FiCheckSquare, group: 'ems' },
    { label: '5 PM Stand-up', href: '/admin/standup', icon: FiCalendar, group: 'ems' },
    { label: 'Evaluations', href: '/admin/evaluations', icon: FiAward, group: 'ems' },
    { label: 'Payroll & Allowances', href: '/admin/payroll', icon: FiDollarSign, group: 'ems' },
    { label: 'Staff Portal', href: '/admin/portal', icon: FiUserCheck, group: 'portal' },
  ];

  const currentNav = navItems.find(
    (item) => pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
  ) || navItems[0];

  return (
    <header className="glass-card border-b border-white/10 rounded-2xl sm:rounded-3xl mb-5 sm:mb-6 shadow-2xl backdrop-blur-2xl bg-slate-950/85">
      <div className="p-3.5 sm:p-5">
        {/* Top Row: Brand, User Info & Global Actions */}
        <div className="flex items-center justify-between gap-3">
          {/* Brand Info */}
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 sm:gap-3 group">
            <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              GM
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-xl font-black text-white uppercase tracking-tight">
                  GoalMills <span className="text-amber-400 text-xs sm:text-sm font-bold">EMS</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[150px] sm:max-w-[240px]">
                {session?.user?.name || 'Managing Director'}{' '}
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-amber-300 font-mono">
                  {session?.user?.role || 'admin'}
                </span>
              </p>
            </div>
          </Link>

          {/* Desktop Right Global Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {session?.user?.role === 'super-admin' && (
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold border border-blue-500/20 transition-all text-xs"
              >
                <FiUsers size={13} />
                <span>User Roles</span>
              </Link>
            )}
            <Link
              href="/admin/categories"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold border border-purple-500/20 transition-all text-xs"
            >
              <FiLayers size={13} />
              <span>Categories</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all text-xs"
            >
              <FiHome size={13} />
              <span>Live Site</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/signin' })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/20 transition-all text-xs"
            >
              <FiLogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile Right Controls: Dropdown Jump + Drawer Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white text-xs font-bold"
              title="View Site"
            >
              <FiHome size={16} />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-all"
              aria-label="Toggle Admin Navigation"
            >
              {mobileMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Module Quick Dropdown Selector */}
        <div className="mt-3 block lg:hidden">
          <div className="relative">
            <select
              value={currentNav.href}
              onChange={(e) => router.push(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-amber-500 pr-9 transition-colors shadow-inner"
            >
              <optgroup label="Editorial & Content Hub">
                <option value="/admin/dashboard">📰 News & Media Publishing</option>
              </optgroup>
              <optgroup label="Employee Management & 30-Day Training">
                <option value="/admin/employees">👥 Employees & Staff Directory</option>
                <option value="/admin/reports">📋 Daily Content Reports</option>
                <option value="/admin/standup">📹 5:00 PM Newsroom Stand-Up</option>
                <option value="/admin/evaluations">🏆 100% Weighted Scorecards</option>
                <option value="/admin/payroll">💵 Payroll & Training Allowances</option>
              </optgroup>
              <optgroup label="Self-Service Portal">
                <option value="/admin/portal">⚡ Staff & Trainee Portal</option>
              </optgroup>
            </select>
            <FiChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={16}
            />
          </div>
        </div>

        {/* Desktop Navigation Pills */}
        <div className="hidden lg:flex items-center gap-1.5 mt-4 pt-3 border-t border-white/10 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile Accordion Drawer */}
        {mobileMenuOpen && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-2 lg:hidden animate-fade-in">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-white/5 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Icon size={15} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              {session?.user?.role === 'super-admin' && (
                <Link
                  href="/admin/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-bold"
                >
                  Users
                </Link>
              )}
              <Link
                href="/admin/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-xl bg-purple-500/10 text-purple-400 text-xs font-bold"
              >
                Categories
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/signin' })}
                className="flex-1 text-center py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
