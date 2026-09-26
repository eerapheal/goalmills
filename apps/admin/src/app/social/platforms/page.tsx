'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiAlertTriangle,
  FiRefreshCw,
  FiSettings,
  FiHelpCircle,
  FiExternalLink,
  FiShield,
  FiCheck,
} from 'react-icons/fi';
import {
  FaTwitter,
  FaTelegramPlane,
  FaWhatsapp,
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok,
} from 'react-icons/fa';

interface PlatformConfigItem {
  platform: string;
  displayName: string;
  description: string;
  isConfigured: boolean;
  enabled: boolean;
  healthStatus: string;
  lastSuccessAt?: string;
  lastError?: string;
  enabledPostTypes: string[];
}

export default function PlatformsConfigPage() {
  const [platforms, setPlatforms] = useState<PlatformConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingPlatform, setUpdatingPlatform] = useState<string | null>(null);
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeHelp, setActiveHelp] = useState<string | null>(null);

  async function loadPlatforms() {
    try {
      const res = await fetch('/api/social/platforms');
      const data = await res.json();
      if (data.success) {
        setPlatforms(data.platforms);
      }
    } catch (err) {
      console.error('Failed to load platforms:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlatforms();
  }, []);

  async function handleToggleEnabled(platformName: string, currentEnabled: boolean) {
    setUpdatingPlatform(platformName);
    setFeedback(null);
    try {
      const res = await fetch('/api/social/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: platformName,
          enabled: !currentEnabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPlatforms((prev) =>
          prev.map((p) =>
            p.platform === platformName ? { ...p, enabled: !currentEnabled } : p
          )
        );
        setFeedback({
          type: 'success',
          message: `${platformName} ${!currentEnabled ? 'enabled' : 'disabled'} for automated publishing.`,
        });
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to update platform' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Update failed' });
    } finally {
      setUpdatingPlatform(null);
    }
  }

  async function handleTestPlatform(platformName: string) {
    setTestingPlatform(platformName);
    setFeedback(null);
    try {
      const res = await fetch('/api/social/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformName, testConnection: true }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: `Connection to ${platformName} verified successfully!`,
        });
        loadPlatforms();
      } else {
        setFeedback({
          type: 'error',
          message: data.error || `Connection test failed for ${platformName}`,
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Test failed' });
    } finally {
      setTestingPlatform(null);
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return <FaTwitter className="text-sky-400" />;
      case 'telegram':
        return <FaTelegramPlane className="text-blue-400" />;
      case 'whatsapp':
        return <FaWhatsapp className="text-emerald-400" />;
      case 'facebook':
        return <FaFacebookF className="text-blue-500" />;
      case 'linkedin':
        return <FaLinkedinIn className="text-sky-500" />;
      case 'youtube':
        return <FaYoutube className="text-red-500" />;
      case 'tiktok':
        return <FaTiktok className="text-rose-400" />;
      default:
        return <FiSettings className="text-slate-400" />;
    }
  };

  const getSetupInstructions = (platform: string) => {
    switch (platform) {
      case 'telegram':
        return {
          steps: [
            '1. Message @BotFather on Telegram and type /newbot to create your bot.',
            '2. Copy the HTTP API token into TELEGRAM_BOT_TOKEN in .env.',
            '3. Create a public or private Telegram Channel for GoalMills.',
            '4. Add your bot as an Administrator with "Post Messages" permission.',
            '5. Set TELEGRAM_CHANNEL_ID to your @channelname or chat ID.',
          ],
          cost: '100% Free, Unlimited Posts, No Rate Limits',
        };
      case 'twitter':
        return {
          steps: [
            '1. Sign in to developer.twitter.com and create a Developer Project & App.',
            '2. Set User authentication settings to "Read and write".',
            '3. Generate Consumer API Key & Secret, and Access Token & Secret.',
            '4. Set TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET in .env.',
          ],
          cost: 'Free Tier (1,500 tweets/month)',
        };
      case 'whatsapp':
        return {
          steps: [
            '1. Go to developers.facebook.com and select your Meta Business App.',
            '2. Add the WhatsApp product to your Meta Developer dashboard.',
            '3. Copy Phone Number ID and permanent System User Access Token.',
            '4. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in .env.',
          ],
          cost: 'Free Tier (1,000 conversations/month)',
        };
      case 'facebook':
        return {
          steps: [
            '1. Create a Facebook Page for GoalMills.',
            '2. Create an app in Meta Developer Console with pages_manage_posts.',
            '3. Generate a long-lived Page Access Token via Graph API Explorer.',
            '4. Set FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN in .env.',
          ],
          cost: '100% Free Graph API',
        };
      case 'linkedin':
        return {
          steps: [
            '1. Create a LinkedIn Company Page for GoalMills.',
            '2. Create an app on linkedin.com/developers with Community Management API.',
            '3. Request w_organization_social and r_organization_social permissions.',
            '4. Set LINKEDIN_ORG_ID and LINKEDIN_ACCESS_TOKEN in .env.',
          ],
          cost: '100% Free Share API',
        };
      case 'youtube':
        return {
          steps: [
            '1. Enable YouTube Data API v3 in Google Cloud Console.',
            '2. Create OAuth 2.0 Credentials with youtube.upload and youtube scopes.',
            '3. Set YOUTUBE_CHANNEL_ID, YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET in .env.',
          ],
          cost: '10,000 Free Daily Quota units',
        };
      case 'tiktok':
        return {
          steps: [
            '1. Register a TikTok Developer App at developers.tiktok.com.',
            '2. Request access to Content Posting API (Direct Post).',
            '3. Generate Access Token with video.publish permissions.',
            '4. Set TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_ACCESS_TOKEN in .env.',
          ],
          cost: '100% Free Creator Posting API',
        };
      default:
        return { steps: [], cost: 'Free' };
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100 min-h-screen">
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <Link
            href="/social"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 mb-2 transition"
          >
            <FiArrowLeft /> Back to Social Dashboard
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Social Platforms Configuration Hub
          </h1>
          <p className="text-sm text-slate-400">
            Manage API credentials, automation toggles, and test live connectivity for all 7 channels
          </p>
        </div>

        <button
          onClick={() => loadPlatforms()}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
              : 'bg-rose-950/40 border-rose-700/60 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <FiCheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <FiAlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-75 hover:opacity-100 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((p) => {
          const isHealthy = p.healthStatus === 'healthy';
          const isConfigured = p.isConfigured;
          const instructions = getSetupInstructions(p.platform);
          const isHelpOpen = activeHelp === p.platform;

          return (
            <div
              key={p.platform}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-5 hover:border-slate-700 transition relative"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-slate-800 text-2xl">
                      {getPlatformIcon(p.platform)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {p.displayName}
                        {isConfigured && (
                          <FiCheckCircle className="text-emerald-400 w-4 h-4" title="Configured" />
                        )}
                      </h3>
                      <span
                        className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1 ${
                          isHealthy
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : !isConfigured
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {isHealthy ? 'Connected & Healthy' : !isConfigured ? 'Setup Required' : 'Degraded / Error'}
                      </span>
                    </div>
                  </div>

                  {/* Enable / Disable Toggle Switch */}
                  <button
                    onClick={() => handleToggleEnabled(p.platform, p.enabled)}
                    disabled={updatingPlatform === p.platform}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      p.enabled ? 'bg-emerald-600' : 'bg-slate-700'
                    }`}
                    title={p.enabled ? 'Disable automation' : 'Enable automation'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        p.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                  {p.description}
                </p>

                {p.lastError && (
                  <div className="mt-3 p-2.5 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-xs">
                    <p className="font-semibold">Last Error:</p>
                    <p className="line-clamp-2 mt-0.5">{p.lastError}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons & Help Toggle */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Tier: <span className="text-slate-200 font-semibold">{instructions.cost}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveHelp(isHelpOpen ? null : p.platform)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 font-semibold transition"
                    >
                      <FiHelpCircle /> {isHelpOpen ? 'Hide Guide' : 'Setup Guide'}
                    </button>
                    <button
                      onClick={() => handleTestPlatform(p.platform)}
                      disabled={testingPlatform === p.platform}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition disabled:opacity-50"
                    >
                      {testingPlatform === p.platform ? 'Testing Ping...' : 'Test Connection'}
                    </button>
                  </div>
                </div>

                {/* Setup Accordion */}
                {isHelpOpen && (
                  <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5 text-xs animate-fade-in">
                    <p className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                      Setup Instructions:
                    </p>
                    <ul className="space-y-1.5 text-slate-300">
                      {instructions.steps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
