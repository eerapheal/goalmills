'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiLogOut,
  FiKey,
  FiTrash2,
  FiSearch,
  FiUsers,
  FiShield,
  FiUserCheck,
  FiFilter,
  FiRefreshCw,
  FiX,
} from 'react-icons/fi';
import { User, UserRole } from '@goalmills/types';
import { useToast } from '@/components/Toast';
import GoalmillsLoader from '@/components/GoalmillsLoader';

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'super-admin', label: 'Super Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'editor', label: 'Editor' },
  { value: 'staff', label: 'Staff' },
  { value: 'contributor', label: 'Contributor' },
  { value: 'user', label: 'User (Reader)' },
];

export default function UserManagementPage() {
  const toast = useToast();
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (roleFilter !== 'all') params.set('role', roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data.users || []);
      } else {
        setError('Failed to fetch users from directory');
      }
    } catch (err) {
      setError('An error occurred connecting to user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  // Client-side quick filter for instantaneous typing response
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const term = search.toLowerCase();
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.role?.toLowerCase().includes(term)
    );
  }, [users, search]);

  // Role distribution metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const superAdmins = users.filter((u) => u.role === 'super-admin').length;
    const editorsAndStaff = users.filter((u) =>
      ['manager', 'editor', 'staff', 'contributor'].includes(u.role)
    ).length;
    const readers = users.filter((u) => u.role === 'user').length;
    return { total, superAdmins, editorsAndStaff, readers };
  }, [users]);

  const updateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole as any } : u)));
        toast.success('User role updated successfully');
      } else {
        toast.error('Failed to update role');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const resetPassword = async (userId: string, username: string) => {
    const inputPassword = prompt(
      `Enter new password for ${username} (leave blank to auto-generate a secure temporary password):`
    );

    if (inputPassword === null) return; // User cancelled

    try {
      const res = await fetch(`/api/admin/users/${userId}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: inputPassword.trim() || undefined }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const creds = data.credentials;
        navigator.clipboard.writeText(creds.newPassword);
        alert(
          `Password for ${creds.username} (${creds.email}) has been reset to:\n\n${creds.newPassword}\n\n(Copied to clipboard)`
        );
        toast.success('Password reset successfully (copied to clipboard)');
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (err) {
      toast.error('An error occurred while resetting password');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.'))
      return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setUsers(users.filter((u) => u._id !== userId));
        toast.success('User deleted successfully');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-card p-6 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-widest mb-1">
            <FiShield /> Identity & Access Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <span>👥</span> User & Role Management
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage system users, enforce role-based access control (RBAC), and issue administrative credential resets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchUsers()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs border border-white/10 transition-colors"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors text-xs border border-white/10"
          >
            <FiArrowLeft />
            <span>Dashboard</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/20 transition-colors text-xs"
          >
            <FiLogOut />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Total Accounts</span>
            <FiUsers className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Active identities</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Super Admins</span>
            <FiShield className="text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">{metrics.superAdmins}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Full governance</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Editorial Staff</span>
            <FiUserCheck className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{metrics.editorsAndStaff}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Newsroom personnel</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Readers / Users</span>
            <FiUsers className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-300">{metrics.readers}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Subscriber base</div>
        </div>
      </div>

      {/* Controls Bar: Search & Role Filter Tabs */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by username, email or role..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        {/* Role Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRoleFilter(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                roleFilter === opt.value
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-16 flex items-center justify-center">
            <GoalmillsLoader label="Loading User Directory" sublabel="Syncing user identities and RBAC permissions..." />
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-400 font-bold space-y-3">
            <p>{error}</p>
            <button
              onClick={() => fetchUsers()}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/20 transition-all"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <FiUsers size={36} className="mx-auto text-slate-600" />
            <p className="text-sm font-bold text-slate-400">
              No users found matching your criteria.
            </p>
            {(search || roleFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setRoleFilter('all');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold border border-blue-500/30 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-white/5 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-white/10">
                  <th className="px-6 py-3.5">User Identity</th>
                  <th className="px-6 py-3.5">Contact Email</th>
                  <th className="px-6 py-3.5">Member Since</th>
                  <th className="px-6 py-3.5">Role Tier</th>
                  <th className="px-6 py-3.5 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => {
                  const isCurrent = user._id === session?.user?.id;
                  return (
                    <tr key={user._id} className="text-white hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold flex items-center gap-2">
                          <span>{user.username}</span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-mono">{user.email}</td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 border ${
                            user.role === 'super-admin'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : user.role === 'manager'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : user.role === 'editor'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : user.role === 'staff'
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                    : user.role === 'contributor'
                                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                                      : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{user.role}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={user.role}
                            onChange={(e) => updateRole(user._id, e.target.value)}
                            disabled={isCurrent}
                            aria-label={`Change role for ${user.username}`}
                            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-40"
                          >
                            <option value="user" className="bg-slate-900 text-white">User (Reader)</option>
                            <option value="contributor" className="bg-slate-900 text-white">Contributor</option>
                            <option value="staff" className="bg-slate-900 text-white">Staff</option>
                            <option value="editor" className="bg-slate-900 text-white">Editor</option>
                            <option value="manager" className="bg-slate-900 text-white">Manager</option>
                            <option value="super-admin" className="bg-slate-900 text-white">Super Admin</option>
                          </select>
                          <button
                            onClick={() => resetPassword(user._id, user.username)}
                            className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors border border-amber-500/20"
                            title="Reset User Password"
                          >
                            <FiKey size={14} />
                          </button>
                          <button
                            onClick={() => deleteUser(user._id)}
                            disabled={isCurrent}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30 border border-red-500/20"
                            title={isCurrent ? 'Cannot delete your own account' : 'Delete User'}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
