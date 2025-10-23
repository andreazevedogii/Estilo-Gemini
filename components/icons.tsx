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
