'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const FOOTER_COLUMNS = [
  {
    title: 'Sports',
    links: [
      { label: 'Football', href: '/football' },
      { label: 'Cricket', href: '/cricket' },
      { label: 'Basketball', href: '/basketball' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'News', href: '/news' },
      { label: 'Newsletter', href: '/newsletter' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Data Deletion', href: '/data-deletion' },
    ],
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#1e293b] bg-[#080f1f] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          {/* Brand Col */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="inline-block mb-3 group">
              <Image
                src="/icon.png"
                alt="GoalMills"
                width={110}
                height={28}
                style={{ width: 'auto', height: 'auto' }}
                className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Africa&apos;s premier sports media — football, cricket, basketball.
            </p>
          </div>

          {/* Nav columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">
                {col.title}
              </h4>
              <ul className="space-y-1.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#1e293b] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-600">
            © {currentYear} GoalMills. All rights reserved.
          </span>
          <div className="h-0.5 w-10 bg-gradient-to-r from-blue-600 via-red-500 to-yellow-400 rounded-full" />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
