'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, FileText, Clock, AlertTriangle, DoorOpen, GraduationCap, Timer } from 'lucide-react';

interface Stats {
  activeTimetables: number;
  draftTimetables: number;
  pendingTimetables: number;
  conflicts: number;
  totalRooms: number;
  totalBatches: number;
  totalTimeSlots: number;
  recentTimetables: Array<{
    _id: string;
    name: string;
    status: string;
    updatedAt: string;
    batch?: { name: string };
  }>;
}

const statusStyles: Record<string, React.CSSProperties> = {
  published: { background: '#EEF5F0', color: '#4A7A5A' },
  approved:  { background: '#EEF5F0', color: '#4A7A5A' },
  pending:   { background: '#FEF3E2', color: '#B8720A' },
  draft:     { background: 'var(--cream)', color: 'var(--text-secondary)' },
  rejected:  { background: '#FFF0F2', color: '#C0445A' },
};

export default function CoordinatorDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/coordinator/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid var(--border-light)', borderTopColor: 'var(--purple)' }} />
      </div>
    );
  }

  const primaryCards = [
    { title: 'Active Timetables', value: stats?.activeTimetables || 0, icon: <CalendarDays className="w-5 h-5" />, color: 'var(--purple)' },
    { title: 'Draft Timetables', value: stats?.draftTimetables || 0, icon: <FileText className="w-5 h-5" />, color: 'var(--teal-dark)' },
    { title: 'Pending Approval', value: stats?.pendingTimetables || 0, icon: <Clock className="w-5 h-5" />, color: '#B8720A' },
    { title: 'Conflicts', value: stats?.conflicts || 0, icon: <AlertTriangle className="w-5 h-5" />, color: '#C0445A' },
  ];

  const secondaryCards = [
    { title: 'Rooms', value: stats?.totalRooms || 0, icon: <DoorOpen className="w-5 h-5" />, color: 'var(--lavender-dark)' },
    { title: 'Batches', value: stats?.totalBatches || 0, icon: <GraduationCap className="w-5 h-5" />, color: '#7B9E87' },
    { title: 'Time Slots', value: stats?.totalTimeSlots || 0, icon: <Timer className="w-5 h-5" />, color: 'var(--purple-dark)' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Coordinator Dashboard</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Timetable management and scheduling</p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {primaryCards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--cream)', color: card.color }}>
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: card.color }}>{card.value}</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{card.title}</p>
          </div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {secondaryCards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--cream)', color: card.color }}>
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: card.color }}>{card.value}</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{card.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
      >
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/coordinator/timetables/new"
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--purple), var(--lavender))' }}
          >
            + Create Timetable
          </Link>
          <Link
            href="/coordinator/rooms"
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'var(--teal-light)', color: 'var(--teal-dark)', border: '1px solid var(--teal)' }}
          >
            Manage Rooms
          </Link>
          <Link
            href="/coordinator/batches"
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'var(--cream)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            Manage Batches
          </Link>
          <Link
            href="/coordinator/timeslots"
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'var(--lavender-light)', color: 'var(--purple-dark)', border: '1px solid var(--lavender)' }}
          >
            Configure Time Slots
          </Link>
        </div>
      </div>

      {/* Recent Timetables */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Timetables</h2>
          <Link href="/coordinator/timetables" className="text-sm font-medium transition-colors" style={{ color: 'var(--purple)' }}>
            View all →
          </Link>
        </div>
        {stats?.recentTimetables && stats.recentTimetables.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Batch</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Last Updated</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTimetables.map((timetable) => (
                  <tr key={timetable._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td className="py-3.5 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{timetable.name}</td>
                    <td className="py-3.5 px-4 text-sm" style={{ color: 'var(--text-muted)' }}>{timetable.batch?.name || '-'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                        style={statusStyles[timetable.status] || statusStyles.draft}
                      >
                        {timetable.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(timetable.updatedAt).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4">
                      <Link href={`/coordinator/timetables/${timetable._id}`} className="text-sm font-medium" style={{ color: 'var(--purple)' }}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
            No timetables created yet.{' '}
            <Link href="/coordinator/timetables/new" className="font-medium" style={{ color: 'var(--purple)' }}>
              Create your first timetable
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
