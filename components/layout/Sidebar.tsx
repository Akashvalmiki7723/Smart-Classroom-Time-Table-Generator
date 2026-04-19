'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Building2, BookOpen, DoorOpen,
  Clock, GraduationCap, CalendarDays, BarChart3, Settings,
  LogOut, ChevronDown, ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

// ─────────────────────────────────────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────────────────────────────────────
const sidebarVariants = {
  open:   { width: '240px' },
  closed: { width: '56px'  },
};
const contentVariants = {
  open:   { opacity: 1, x: 0,   display: 'block',  transition: { delay: 0.1 } },
  closed: { opacity: 0, x: -10, transitionEnd: { display: 'none' } },
};
const transitionProps: any = { type: 'tween', ease: 'easeOut', duration: 0.2 };

// ─────────────────────────────────────────────────────────────────────────────
// Nav configs per role
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS: Record<string, { href: string; label: string; icon: React.ReactNode }[]> = {
  admin: [
    { href: '/admin/dashboard',   label: 'Dashboard',   icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/admin/users',       label: 'Users',       icon: <Users className="w-4 h-4" /> },
    { href: '/admin/departments', label: 'Departments', icon: <Building2 className="w-4 h-4" /> },
    { href: '/admin/subjects',    label: 'Subjects',    icon: <BookOpen className="w-4 h-4" /> },
    { href: '/admin/rooms',       label: 'Rooms',       icon: <DoorOpen className="w-4 h-4" /> },
    { href: '/admin/time-slots',  label: 'Time Slots',  icon: <Clock className="w-4 h-4" /> },
    { href: '/admin/batches',     label: 'Batches',     icon: <GraduationCap className="w-4 h-4" /> },
    { href: '/admin/timetables',  label: 'Timetables',  icon: <CalendarDays className="w-4 h-4" /> },
    { href: '/admin/reports',     label: 'Reports',     icon: <BarChart3 className="w-4 h-4" /> },
  ],
  hod: [
    { href: '/hod/dashboard',    label: 'Dashboard',   icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/hod/department',   label: 'Department',  icon: <Building2 className="w-4 h-4" /> },
    { href: '/hod/faculty',      label: 'Faculty',     icon: <Users className="w-4 h-4" /> },
    { href: '/hod/subjects',     label: 'Subjects',    icon: <BookOpen className="w-4 h-4" /> },
    { href: '/hod/timetables',   label: 'Timetables',  icon: <CalendarDays className="w-4 h-4" /> },
    { href: '/hod/reports',      label: 'Reports',     icon: <BarChart3 className="w-4 h-4" /> },
  ],
  coordinator: [
    { href: '/coordinator/dashboard',   label: 'Dashboard',   icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/coordinator/timetables',  label: 'Timetables',  icon: <CalendarDays className="w-4 h-4" /> },
    { href: '/coordinator/rooms',       label: 'Rooms',       icon: <DoorOpen className="w-4 h-4" /> },
    { href: '/coordinator/timeslots',   label: 'Time Slots',  icon: <Clock className="w-4 h-4" /> },
    { href: '/coordinator/batches',     label: 'Batches',     icon: <GraduationCap className="w-4 h-4" /> },
  ],
  faculty: [
    { href: '/faculty/dashboard',   label: 'Dashboard',   icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/faculty/schedule',    label: 'My Schedule',  icon: <CalendarDays className="w-4 h-4" /> },
    { href: '/faculty/subjects',    label: 'Subjects',     icon: <BookOpen className="w-4 h-4" /> },
    { href: '/faculty/leaves',      label: 'Leave Mgmt',   icon: <GraduationCap className="w-4 h-4" /> },
  ],
  student: [
    { href: '/student/dashboard',   label: 'Dashboard',   icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/student/timetable',   label: 'My Timetable', icon: <CalendarDays className="w-4 h-4" /> },
    { href: '/student/rooms',       label: 'Classrooms',   icon: <DoorOpen className="w-4 h-4" /> },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
interface SidebarProps {
  userRole: string;
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ userRole, userName = 'User', userEmail = '' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const role = userRole?.toLowerCase() || 'student';
  const navItems = NAV_ITEMS[role] || NAV_ITEMS.student;

  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <motion.div
      className="fixed left-0 top-0 z-40 h-full shrink-0"
      initial="closed"
      animate={isCollapsed ? 'closed' : 'open'}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => { setIsCollapsed(true); setShowUserMenu(false); }}
    >
      <div
        className="relative flex h-full flex-col"
        style={{
          background: '#FFFFFF',
          borderRight: '1px solid #EDE6DE',
          boxShadow: '2px 0 12px rgba(45,32,64,0.06)',
        }}
      >
        {/* Logo */}
        <div
          className="flex h-14 items-center gap-3 px-3 shrink-0"
          style={{ borderBottom: '1px solid #EDE6DE' }}
        >
          <div className="shrink-0">
            <Image src="/logo.png" alt="Presidency University" width={32} height={32} className="rounded-lg" />
          </div>
          <motion.div
            variants={contentVariants}
            transition={transitionProps}
            className="overflow-hidden"
          >
            <p className="text-xs font-bold leading-none whitespace-nowrap" style={{ color: '#1B2B5B' }}>Presidency</p>
            <p className="text-[10px] whitespace-nowrap" style={{ color: '#9B8EC7' }}>University</p>
          </motion.div>
        </div>

        {/* Nav Items */}
        <div className="flex flex-col flex-1 overflow-hidden py-3 px-2 gap-0.5">
          {navItems.map(item => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-all group',
                  isActive
                    ? 'font-semibold'
                    : 'hover:bg-[#F8F3EE]'
                )}
                style={isActive
                  ? { background: 'linear-gradient(135deg, #9B8EC720, #BDA6CE20)', color: '#9B8EC7' }
                  : { color: '#6B5F7A' }
                }
              >
                <span className="shrink-0" style={{ color: isActive ? '#9B8EC7' : '#9B93A8' }}>
                  {item.icon}
                </span>
                <motion.span
                  variants={contentVariants}
                  transition={transitionProps}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
                {isActive && (
                  <motion.div
                    variants={contentVariants}
                    transition={transitionProps}
                    className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: '#9B8EC7' }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom: Settings + User */}
        <div className="shrink-0 pb-3 px-2 space-y-0.5" style={{ borderTop: '1px solid #EDE6DE', paddingTop: '8px' }}>
          <Link
            href={`/${role}/profile`}
            className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-all hover:bg-[#F8F3EE]"
            style={{ color: '#6B5F7A' }}
          >
            <Settings className="w-4 h-4 shrink-0" style={{ color: '#9B93A8' } as React.CSSProperties} />
            <motion.span variants={contentVariants} transition={transitionProps} className="whitespace-nowrap">Settings</motion.span>
          </Link>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm transition-all hover:bg-[#F8F3EE]"
              style={{ color: '#6B5F7A' }}
            >
              <div
                className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #9B8EC7, #BDA6CE)' }}
              >
                {initials}
              </div>
              <motion.div variants={contentVariants} transition={transitionProps} className="flex-1 min-w-0 text-left">
                <p className="font-medium text-xs truncate">{userName}</p>
                <p className="text-[10px] truncate" style={{ color: '#9B93A8' }}>{userEmail}</p>
              </motion.div>
              <motion.span variants={contentVariants} transition={transitionProps}>
                <ChevronDown className="w-3 h-3 shrink-0" style={{ color: '#9B93A8' } as React.CSSProperties} />
              </motion.span>
            </button>

            {showUserMenu && !isCollapsed && (
              <div
                className="absolute bottom-10 left-0 right-0 rounded-xl overflow-hidden shadow-lg z-50"
                style={{ background: '#FFFFFF', border: '1px solid #EDE6DE' }}
              >
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-[#F8F3EE]"
                  style={{ color: '#C0445A' }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Sidebar;
