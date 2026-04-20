'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, BookOpen, DoorOpen, GraduationCap, Clock, MapPin } from 'lucide-react';

interface TimetableInfo {
  _id: string;
  name: string;
  academicYear: string;
  semester: number;
  status: string;
  department?: { _id: string; name: string; code: string };
  batch?: { _id: string; name: string; year: number; division: string };
  entries: Array<{
    day: number;
    slot: number;
    subject: { _id: string; name: string; code: string; type: string } | null;
    faculty: { _id: string; name: string } | null;
    room: { _id: string; name: string; building: string; floor: string } | null;
    batch: { _id: string; name: string; year: number; semester: number; division: string } | null;
    type: string;
  }>;
}

interface TimeSlot {
  _id: string;
  slotNumber: number;
  startTime: string;
  endTime: string;
  type: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StudentDashboard() {
  const [timetables, setTimetables] = useState<TimetableInfo[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ttRes, tsRes] = await Promise.all([
        fetch('/api/timetables'),
        fetch('/api/time-slots'),
      ]);
      if (ttRes.ok) {
        const data = await ttRes.json();
        setTimetables(data.timetables || []);
      }
      if (tsRes.ok) {
        const data = await tsRes.json();
        setTimeSlots(data.timeSlots || []);
      }
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
  const todayIndex = today.getDay() === 0 ? -1 : today.getDay() - 1;

  // Get today's entries across all timetables
  const todaysEntries = timetables.flatMap(tt =>
    tt.entries
      .filter(e => e.day === todayIndex)
      .map(e => ({ ...e, timetableName: tt.name }))
  ).sort((a, b) => a.slot - b.slot);

  // Count total classes this week
  const totalWeeklyClasses = timetables.reduce((sum, tt) => sum + tt.entries.length, 0);

  // Get unique subjects
  const uniqueSubjects = new Set(
    timetables.flatMap(tt => tt.entries.map(e => e.subject?._id).filter(Boolean))
  );

  // Get time for a slot
  const getSlotTime = (slotNum: number) => {
    const slot = timeSlots.find(ts => ts.slotNumber === slotNum);
    return slot ? { start: slot.startTime, end: slot.endTime } : { start: '—', end: '—' };
  };

  const statCards = [
    { title: "Today's Classes", value: todaysEntries.length, icon: <CalendarDays className="w-5 h-5" />, color: 'var(--purple)' },
    { title: 'Weekly Classes', value: totalWeeklyClasses, icon: <Clock className="w-5 h-5" />, color: 'var(--teal-dark)' },
    { title: 'Subjects', value: uniqueSubjects.size, icon: <BookOpen className="w-5 h-5" />, color: 'var(--lavender-dark)' },
    { title: 'Timetables', value: timetables.length, icon: <GraduationCap className="w-5 h-5" />, color: '#B8720A' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Student Dashboard</h1>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <Link href="/student/timetable" className="block">
          <div
            className="rounded-2xl p-6 text-white transition-all hover:opacity-95 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, var(--purple), var(--lavender))', boxShadow: '0 4px 15px rgba(155,142,199,0.4)' }}
          >
            <h3 className="text-base font-semibold mb-1">View My Timetable</h3>
            <p className="text-sm opacity-80">See your complete weekly class schedule</p>
          </div>
        </Link>
        <Link href="/student/rooms" className="block">
          <div
            className="rounded-2xl p-6 transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--teal-light)', border: '1px solid var(--teal)', color: 'var(--teal-dark)' }}
          >
            <h3 className="text-base font-semibold mb-1">View Classrooms</h3>
            <p className="text-sm opacity-80">Browse available rooms and their details</p>
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
              href="/student/timetable"
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
        ) : todaysEntries.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--cream)' }}>
              <BookOpen className="w-6 h-6" style={{ color: 'var(--purple)' }} />
            </div>
            <p style={{ color: 'var(--text-muted)' }}>No classes scheduled for today.</p>
          </div>
        ) : (
          <div>
            {todaysEntries.map((entry, index) => {
              const time = getSlotTime(entry.slot);
              return (
                <div key={index} className="p-4 flex items-center gap-4 hover:bg-[#FAF6F2] transition-colors" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{time.start}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{time.end}</div>
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
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {entry.room?.building && entry.room?.floor ? `${entry.room.building}, Floor ${entry.room.floor}` : ''}
                    </div>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{entry.faculty?.name || 'N/A'}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Faculty</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
