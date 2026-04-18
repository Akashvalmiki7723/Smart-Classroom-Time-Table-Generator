'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, BookOpen, Clock, Clipboard } from 'lucide-react';

interface DashboardStats {
  todaysClasses: number;
  totalClassesThisWeek: number;
  assignedSubjects: number;
  pendingLeaves: number;
  approvedLeaves: number;
  leavesThisWeek: number;
  dayOfWeek: number;
}

interface ScheduleEntry {
  slot: number;
  slotName: string;
  startTime: string;
  endTime: string;
  subject: { _id: string; name: string; code: string; type: string } | null;
  room: { _id: string; name: string; building: string; floor: string } | null;
  batch: { _id: string; name: string; year: number; semester: number; division: string } | null;
  type: string;
  timetableName: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function FacultyDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todaysSchedule, setTodaysSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, scheduleRes] = await Promise.all([
        fetch('/api/faculty/stats'),
        fetch('/api/faculty/schedule?view=day&day=' + (new Date().getDay() === 0 ? 5 : new Date().getDay() - 1)),
      ]);
      if (statsRes.ok) { const data = await statsRes.json(); setStats(data); }
      if (scheduleRes.ok) { const data = await scheduleRes.json(); setTodaysSchedule(data.classes || []); }
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const today = new Date();
  const dayName = DAYS[today.getDay() === 0 ? 5 : today.getDay() - 1] || 'Sunday';
  const isWeekend = today.getDay() === 0;

  const statCards = [
    { title: "Today's Classes", value: stats?.todaysClasses || 0, icon: <CalendarDays className="w-5 h-5" />, color: 'var(--purple)' },
    { title: 'Weekly Classes', value: stats?.totalClassesThisWeek || 0, icon: <Clipboard className="w-5 h-5" />, color: 'var(--teal-dark)' },
    { title: 'Assigned Subjects', value: stats?.assignedSubjects || 0, icon: <BookOpen className="w-5 h-5" />, color: 'var(--lavender-dark)' },
    { title: 'Pending Leaves', value: stats?.pendingLeaves || 0, icon: <Clock className="w-5 h-5" />, color: '#B8720A' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Faculty Dashboard</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => (
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <Link href="/faculty/schedule" className="block">
          <div
            className="rounded-2xl p-6 text-white transition-all hover:opacity-95 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, var(--purple), var(--lavender))', boxShadow: '0 4px 15px rgba(155,142,199,0.4)' }}
          >
            <h3 className="text-base font-semibold mb-1">View Full Schedule</h3>
            <p className="text-sm opacity-80">See your complete weekly timetable</p>
          </div>
        </Link>
        <Link href="/faculty/leaves" className="block">
          <div
            className="rounded-2xl p-6 transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--teal-light)', border: '1px solid var(--teal)', color: 'var(--teal-dark)' }}
          >
            <h3 className="text-base font-semibold mb-1">Apply for Leave</h3>
            <p className="text-sm opacity-80">Submit a new leave request</p>
          </div>
        </Link>
        <Link href="/faculty/subjects" className="block">
          <div
            className="rounded-2xl p-6 transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--lavender-light)', border: '1px solid var(--lavender)', color: 'var(--purple-dark)' }}
          >
            <h3 className="text-base font-semibold mb-1">My Subjects</h3>
            <p className="text-sm opacity-80">View assigned subjects and details</p>
          </div>
        </Link>
      </div>

      {/* Today's Schedule */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="p-6" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Today&apos;s Schedule - {dayName}
            </h2>
            <Link
              href="/faculty/schedule"
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: 'var(--cream)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              View Week
            </Link>
          </div>
        </div>

        {isWeekend ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--cream)' }}>
              <CalendarDays className="w-6 h-6" style={{ color: 'var(--purple)' }} />
            </div>
            <p style={{ color: 'var(--text-muted)' }}>It&apos;s Sunday! Enjoy your day off.</p>
          </div>
        ) : todaysSchedule.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--cream)' }}>
              <BookOpen className="w-6 h-6" style={{ color: 'var(--purple)' }} />
            </div>
            <p style={{ color: 'var(--text-muted)' }}>No classes scheduled for today.</p>
          </div>
        ) : (
          <div>
            {todaysSchedule.map((entry, index) => (
              <div key={index} className="p-4 flex items-center gap-4 hover:bg-[#FAF6F2] transition-colors" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <div className="flex-shrink-0 w-20 text-center">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{entry.startTime}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{entry.endTime}</div>
                </div>
                <div className="w-1 h-12 rounded-full" style={{ background: entry.type === 'practical' ? 'var(--teal-dark)' : 'var(--purple)' }} />
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{entry.subject?.code || 'N/A'}</span>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                      style={entry.type === 'practical' ? { background: '#EEF5F0', color: '#4A7A5A' } : { background: 'var(--lavender-light)', color: 'var(--purple-dark)' }}
                    >
                      {entry.type}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{entry.subject?.name || 'Unknown Subject'}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{entry.room?.name || 'TBA'}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{entry.room?.building}, Floor {entry.room?.floor}</div>
                </div>
                <div className="text-right min-w-[100px]">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{entry.batch?.name || 'N/A'}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Year {entry.batch?.year}, Sem {entry.batch?.semester}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
