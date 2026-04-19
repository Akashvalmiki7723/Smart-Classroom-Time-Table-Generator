'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface Notification {
  _id?: string;
  id?: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  read?: boolean;
  createdAt?: string;
  link?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sample notifications (fallback when no API data)
// ─────────────────────────────────────────────────────────────────────────────
const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Timetable Published',
    message: 'The timetable for Semester 4 has been published by the coordinator.',
    type: 'success',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Room Change Notice',
    message: 'Room 301 is under maintenance. Classes moved to Room 405.',
    type: 'warning',
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: '3',
    title: 'New Faculty Added',
    message: 'Dr. Sarah Johnson has been added to the Computer Science department.',
    type: 'info',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '4',
    title: 'Schedule Conflict Resolved',
    message: 'The scheduling conflict for Monday 10 AM has been automatically resolved.',
    type: 'success',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function NotificationBell() {
  const [items, setItems] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch real notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        if (data.notifications && data.notifications.length > 0) {
          setItems(data.notifications);
        }
        // If no real notifications, keep sample data
      }
    } catch {
      // Keep sample data on error
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = items.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' });
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Silently fail
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const typeColors: Record<string, string> = {
    info: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground shadow-sm shadow-black/5 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-accent"
            >
              <Check className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[320px]">
          <div className="divide-y divide-border">
            {items.map((item, idx) => (
              <div
                key={item._id || item.id || idx}
                className={`flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${
                  !item.read ? 'bg-muted/30' : ''
                }`}
              >
                {item.type && (
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${typeColors[item.type] || 'bg-muted-foreground'}`}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {item.message}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground/70">
                    {formatTime(item.createdAt)}
                  </p>
                </div>
                {!item.read && (
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        {items.length === 0 && (
          <div className="px-4 py-8 text-center">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No notifications yet</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
