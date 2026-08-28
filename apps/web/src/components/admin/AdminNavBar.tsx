'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'react-icons/fi';

export default function AdminNavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { label: 'News & Media', href: '/admin/dashboard', icon: FiFileText },
    { label: 'Employees & Staff', href: '/admin/employees', icon: FiUsers },
    { label: 'Daily Reports', href: '/admin/reports', icon: FiCheckSquare },
    { label: '5 PM Stand-up', href: '/admin/standup', icon: FiCalendar },
    { label: 'Evaluations', href: '/admin/evaluations', icon: FiAward },
    { label: 'Payroll & Allowances', href: '/admin/payroll', icon: FiDollarSign },
    { label: 'Staff Portal', href: '/admin/portal', icon: FiUserCheck },
  ];

  return (
    <header className="glass-card border-b border-white/10 p-4 sm:p-5 rounded-3xl mb-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-500/20">
              GM
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                GoalMills Newsroom & EMS
              </h1>
              <p className="text-xs text-text-muted">
                Logged in as <span className="text-amber-400 font-bold">{session?.user?.name || 'Managing Director'}</span>{' '}
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white font-mono ml-1">
                  {session?.user?.role || 'admin'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
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
      </div>

      {/* Navigation Pills */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
