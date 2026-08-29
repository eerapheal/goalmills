'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  isPushNotificationSupported,
  getNotificationPermissionState,
  requestAndRegisterWebPush,
  disableWebPush,
} from '../lib/firebaseClient';
import Link from 'next/link';
import { useToast } from './Toast';

interface NotificationItem {
  _id: string;
  title: string;
  body: string;
  topic?: string;
  createdAt: string;
  data?: {
    url?: string;
    matchId?: string;
    newsId?: string;
  };
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'all',
    'breaking_news',
    'live_scores',
  ]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsSupported(isPushNotificationSupported());
    const storedEnabled = localStorage.getItem('goalmills_web_push_enabled') === 'true';
    const permission = getNotificationPermissionState();
    setIsEnabled(storedEnabled && permission === 'granted');

    fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications/history?limit=10');
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const toast = useToast();

  const handleTogglePush = async () => {
    setLoading(true);
    if (!isEnabled) {
      const res = await requestAndRegisterWebPush(selectedTopics);
      if (res.success) {
        setIsEnabled(true);
        toast.success('Push notifications enabled!');
      } else {
        toast.error(res.error || 'Could not enable push notifications');
      }
    } else {
      await disableWebPush();
      setIsEnabled(false);
      toast.info('Push notifications disabled');
    }
    setLoading(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all focus:outline-none"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Pulse Dot */}
        {isEnabled && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/15 shadow-2xl p-4 z-50 text-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base">Alerts &amp; Updates</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold">
                FCM Push
              </span>
            </div>
            <button
              onClick={fetchNotifications}
              className="text-xs text-slate-400 hover:text-white"
            >
              Refresh
            </button>
          </div>

          {/* Push Enable Card */}
          {isSupported && (
            <div className="my-3 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Browser Push Alerts</p>
                <p className="text-[11px] text-slate-400">
                  {isEnabled
                    ? 'Active (Live scores & breaking news)'
                    : 'Get live score & goal notifications'}
                </p>
              </div>
              <button
                onClick={handleTogglePush}
                disabled={loading}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  isEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {loading ? '...' : isEnabled ? 'Enabled' : 'Enable'}
              </button>
            </div>
          )}

          {/* Notifications Feed */}
          <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 py-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <p className="text-lg mb-1">🔔</p>
                No recent notifications.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/5 transition-all text-xs"
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-white text-xs">{n.title}</p>
                    <span className="text-[10px] text-slate-500">
                      {new Date(n.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{n.body}</p>
                  {n.data?.url && (
                    <Link
                      href={n.data.url}
                      onClick={() => setIsOpen(false)}
                      className="inline-block mt-1.5 text-blue-400 hover:underline text-[10px] font-medium"
                    >
                      View Details →
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-white/10 text-center text-[10px] text-slate-500">
            GoalMills Firebase Push Notification Gateway
          </div>
        </div>
      )}
    </div>
  );
}
