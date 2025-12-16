'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
    className?: string;
}

export function BackButton({ className = '' }: BackButtonProps) {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className={`
                group flex items-center justify-center w-10 h-10 rounded-full 
                bg-surfaceHighlight/80 backdrop-blur-md border border-white/10
                hover:bg-secondary hover:border-secondary transition-all duration-300
                shadow-[0_8px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]
                active:scale-95 z-50
                ${className}
            `}
            aria-label="Go back"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-white group-hover:text-surface transition-colors"
            >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
            </svg>
        </button>
    );
}
