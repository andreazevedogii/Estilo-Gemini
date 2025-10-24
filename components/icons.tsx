import React from 'react';

export const MagicWandIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104l-1.38 1.38a3.375 3.375 0 00-1.03 2.366l.002 1.252a3.375 3.375 0 001.03 2.366l1.38 1.38m0 0a3.375 3.375 0 002.366 1.03h1.252a3.375 3.375 0 002.366-1.03l1.38-1.38m-5.112-5.112a3.375 3.375 0 00-1.03-2.366l-.002-1.252a3.375 3.375 0 001.03-2.366l1.38-1.38m5.112 5.112a3.375 3.375 0 002.366 1.03h1.252a3.375 3.375 0 002.366-1.03l1.38-1.38m-5.112 5.112l-1.38 1.38a3.375 3.375 0 00-1.03 2.366l.002 1.252a3.375 3.375 0 001.03 2.366l1.38 1.38" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 21.75l1.5-1.5m6-6l1.5-1.5m-6 6l-1.5 1.5m6-6l-1.5-1.5" />
  </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18l-1.813-2.096a4.5 4.5 0 01-.62-3.412V9.75a4.5 4.5 0 011.232-3.248L12 3l3.201 3.502a4.5 4.5 0 011.232 3.248v2.742a4.5 4.5 0 01-.62 3.412L15 18l-.813-2.096a4.5 4.5 0 00-4.374 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1.5v2.25m-4.5 3.75h2.25m7.5 0h2.25M12 22.5v-2.25m-4.5-3.75H5.25m13.5 0H18.75" />
  </svg>
);

export const LoaderIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export const DiamondIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 9l10 12L22 9l-10-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 9l10 12M22 9l-10 12M12 2v20" />
    </svg>
);

export const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.223 0-9.657-3.356-11.303-7.918l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.447-2.274 4.481-4.242 5.842L37.134 39.4c3.512-3.391 5.866-8.039 5.866-13.483c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);