'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [username, setUsername] = useState('');
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setUsername(session.user.name || '');
      setImage(session.user.image || '');
    } else if (session === null) {
      // Redirect if not authenticated
      router.push('/signin');
    }
  }, [session, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      setImage(data.url);
      setMessage({ text: 'Image uploaded! Remember to save changes.', type: 'success' });
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Failed to upload image', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, image }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: username,
          image: image,
        },
      });

      setMessage({ text: 'Profile updated successfully!', type: 'success' });

      // Force router refresh to update header
      router.refresh();
    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-950 px-4 pt-[100px] pb-12">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-black text-white mb-8 tracking-tight">
          My <span className="text-blue-500">Profile</span>
        </h1>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-900 group">
                {image ? (
                  <Image src={image} alt="Profile" fill sizes="128px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-700 bg-slate-800">
                    {username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}

                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-white text-xs font-bold uppercase">Change</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              <div className="text-center">
                <p className="text-sm text-slate-400">Allowed formats: JPG, PNG, GIF</p>
                {uploading && (
                  <p className="text-blue-400 text-xs mt-1 animate-pulse">Uploading...</p>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={session.user?.email || ''}
                  disabled
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-600 mt-1">Email cannot be changed</p>
              </div>
            </div>

            {message.text && (
              <div
                className={`p-4 rounded-xl text-sm font-bold ${
                  message.type === 'success'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="pt-4 flex items-center justify-between gap-4">
              {session.user.role?.includes('admin') && (
                <Link
                  href="/admin/dashboard"
                  className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors text-sm"
                >
                  Admin Dashboard
                </Link>
              )}

              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
