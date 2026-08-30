import React from 'react';

/**
 * Original SVG Logo mark combining a speech bubble and a check mark
 */
export function TermlyLogo({ className = "w-8 h-8", title = "Termly" }: { className?: string; title?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      {/* Speech bubble base */}
      <path 
        d="M8 20C8 12.268 14.268 6 22 6H26C33.732 6 40 12.268 40 20C40 27.732 33.732 34 26 34H18L10 40V32.8C8.756 31.08 8 29.13 8 27V20Z" 
        fill="#155E59" 
      />
      {/* Warm accent dot */}
      <circle cx="36" cy="12" r="3" fill="#D9A441" />
      {/* High-contrast crisp checkmark */}
      <path 
        d="M17 20.5L22 25.5L31 15.5" 
        stroke="#FAF8F2" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}

export const SamajhLogo = TermlyLogo;

/**
 * Purposeful SVG Illustration: Wallet & Incoming Money
 */
export function WalletIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="18" width="52" height="38" rx="8" fill="#155E59" />
      <path d="M12 18V14C12 10.686 14.686 8 18 8H46C49.314 8 52 10.686 52 14V18" stroke="#D3CCBE" strokeWidth="2.5" strokeLinecap="round" />
      {/* Cash note emerging */}
      <rect x="16" y="12" width="32" height="12" rx="3" fill="#E8F3EC" stroke="#155E59" strokeWidth="1.5" />
      <circle cx="32" cy="18" r="2.5" fill="#155E59" />
      {/* Wallet flap & clasp */}
      <path d="M38 30H58V44H38C34.686 44 32 41.314 32 38V36C32 32.686 34.686 30 38 30Z" fill="#FAF8F2" stroke="#E5E0D5" strokeWidth="1.5" />
      <circle cx="48" cy="37" r="3.5" fill="#D9A441" />
    </svg>
  );
}

/**
 * Purposeful SVG Illustration: Calendar & Instalment Milestones
 */
export function CalendarIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Calendar back */}
      <rect x="8" y="12" width="48" height="46" rx="8" fill="#FFFFFF" stroke="#203331" strokeWidth="2.5" />
      {/* Header banner */}
      <path d="M8 20C8 15.582 11.582 12 16 12H48C52.418 12 56 15.582 56 20V24H8V20Z" fill="#155E59" />
      {/* Binding rings */}
      <rect x="18" y="6" width="4" height="10" rx="2" fill="#D9A441" />
      <rect x="42" y="6" width="4" height="10" rx="2" fill="#D9A441" />
      {/* Grid milestones */}
      <circle cx="20" cy="34" r="4" fill="#E8F3EC" stroke="#155E59" strokeWidth="1.5" />
      <path d="M18.5 34L19.5 35L21.5 33" stroke="#155E59" strokeWidth="1.5" strokeLinecap="round" />
      
      <circle cx="32" cy="34" r="4" fill="#E8F3EC" stroke="#155E59" strokeWidth="1.5" />
      <circle cx="44" cy="34" r="4" fill="#FDF6E9" stroke="#D9A441" strokeWidth="1.5" />
      <text x="44" y="36.5" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#203331">2</text>
      
      <circle cx="20" cy="46" r="4" fill="#E8F3EC" stroke="#155E59" strokeWidth="1.5" />
      <circle cx="32" cy="46" r="4" fill="#E8F3EC" stroke="#155E59" strokeWidth="1.5" />
      <circle cx="44" cy="46" r="4" fill="#E8F3EC" stroke="#155E59" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Purposeful SVG Illustration: Key Fact Statement (KFS) Document
 */
export function DocumentIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Document page */}
      <path d="M12 10C12 6.686 14.686 4 18 4H38L52 18V54C52 57.314 49.314 60 46 60H18C14.686 60 12 57.314 12 54V10Z" fill="#FFFFFF" stroke="#203331" strokeWidth="2.5" />
      {/* Fold corner */}
      <path d="M38 4V18H52" fill="#FAF8F2" stroke="#203331" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Text lines */}
      <rect x="20" y="24" width="24" height="3" rx="1.5" fill="#155E59" />
      <rect x="20" y="32" width="20" height="2.5" rx="1.25" fill="#D3CCBE" />
      <rect x="20" y="38" width="24" height="2.5" rx="1.25" fill="#D3CCBE" />
      {/* Verified seal */}
      <circle cx="40" cy="48" r="7" fill="#E8F3EC" stroke="#155E59" strokeWidth="2" />
      <path d="M37 48L39 50L43 46" stroke="#155E59" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Purposeful SVG: Speech check icon for micro badges
 */
export function CheckCircleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" fill="#E8F3EC" stroke="#155E59" strokeWidth="1.5" />
      <path d="M6 10L8.5 12.5L14 7.5" stroke="#155E59" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
