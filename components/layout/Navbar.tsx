'use client';

import NotificationBell from '@/components/NotificationBell';

interface NavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <header
      className="h-16 flex items-center justify-between px-6 sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      {/* Left side */}
      <div className="flex items-center">
        <button className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Right side — notification bell only (profile is in sidebar) */}
      <div className="flex items-center gap-3">
        <NotificationBell />
      </div>
    </header>
  );
}
