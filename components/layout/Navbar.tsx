'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NotificationBell from '@/components/NotificationBell';

interface NavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export default function Navbar({ user }: NavbarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const roleBasePath = user.role || 'student';

  const handleProfileClick = () => {
    setShowDropdown(false);
    router.push(`/${roleBasePath}/profile`);
  };

  const handleSettingsClick = () => {
    setShowDropdown(false);
    router.push(`/${roleBasePath}/settings`);
  };

  const roleLabels: Record<string, string> = {
    admin: 'Super Admin',
    hod: 'Head of Department',
    coordinator: 'Coordinator',
    faculty: 'Faculty',
    student: 'Student',
  };

  const roleColors: Record<string, string> = {
    admin: 'var(--purple)',
    hod: 'var(--teal-dark)',
    coordinator: 'var(--lavender-dark)',
    faculty: '#7B9E87',
    student: '#B8956A',
  };

  const avatarColor = roleColors[user.role || ''] || 'var(--purple)';

  return (
    <header
      className="h-16 flex items-center justify-between px-6 sticky top-0 z-20"
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Left side */}
      <div className="flex items-center">
        <button className="lg:hidden p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <NotificationBell />

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
            style={{ background: showDropdown ? 'var(--cream)' : 'transparent' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
              style={{ background: avatarColor }}
            >
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                {user.name}
              </p>
              <p className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>
                {roleLabels[user.role || ''] || user.role}
              </p>
            </div>
            <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div
                className="absolute right-0 mt-2 w-52 rounded-xl py-2 z-20"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                </div>
                <button
                  onClick={handleProfileClick}
                  className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5 transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </button>
                <button
                  onClick={handleSettingsClick}
                  className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5 transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
                <div style={{ borderTop: '1px solid var(--border-light)', margin: '6px 0' }} />
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5 transition-colors"
                  style={{ color: '#C0445A' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FFF0F2')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
