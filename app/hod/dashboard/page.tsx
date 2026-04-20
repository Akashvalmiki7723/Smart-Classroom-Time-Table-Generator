'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Users, BookOpen, Clock } from 'lucide-react';

export default function HodDashboard() {
  const [stats, setStats] = useState({ subjects: 0, timetables: 0, published: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [subRes, ttRes] = await Promise.all([
          fetch('/api/subjects'), fetch('/api/timetables'),
        ]);
        const subs = subRes.ok ? await subRes.json() : { subjects: [] };
        const tts = ttRes.ok ? await ttRes.json() : { timetables: [] };
        const ttList = Array.isArray(tts.timetables) ? tts.timetables : [];
        setStats({
          subjects: Array.isArray(subs.subjects) ? subs.subjects.length : 0,
          timetables: ttList.length,
          published: ttList.filter((t: any) => t.status === 'published').length,
          pending: ttList.filter((t: any) => t.status === 'pending').length,
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid var(--border-light)', borderTopColor: 'var(--purple)' }} />
    </div>
  );

  const today = new Date();
  const cards = [
    { title: 'Subjects', value: stats.subjects, icon: <BookOpen className="w-5 h-5" />, color: 'var(--purple)' },
    { title: 'Total Timetables', value: stats.timetables, icon: <CalendarDays className="w-5 h-5" />, color: 'var(--teal-dark)' },
    { title: 'Published', value: stats.published, icon: <Users className="w-5 h-5" />, color: 'var(--lavender-dark)' },
    { title: 'Pending Approvals', value: stats.pending, icon: <Clock className="w-5 h-5" />, color: '#B8720A' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>HOD Dashboard</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map(card => (
          <div key={card.title} className="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--cream)', color: card.color }}>{card.icon}</div>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: card.color }}>{card.value}</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{card.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Link href="/hod/department" className="block">
          <div className="rounded-2xl p-6 text-white transition-all hover:opacity-95 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, var(--purple), var(--lavender))', boxShadow: '0 4px 15px rgba(155,142,199,0.4)' }}>
            <h3 className="text-base font-semibold mb-1">Department Info</h3>
            <p className="text-sm opacity-80">View department details</p>
          </div>
        </Link>
        <Link href="/hod/timetables" className="block">
          <div className="rounded-2xl p-6 transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--teal-light)', border: '1px solid var(--teal)', color: 'var(--teal-dark)' }}>
            <h3 className="text-base font-semibold mb-1">Timetables</h3>
            <p className="text-sm opacity-80">View and approve timetables</p>
          </div>
        </Link>
        <Link href="/hod/subjects" className="block">
          <div className="rounded-2xl p-6 transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--lavender-light)', border: '1px solid var(--lavender)', color: 'var(--purple-dark)' }}>
            <h3 className="text-base font-semibold mb-1">Subjects</h3>
            <p className="text-sm opacity-80">View department subjects</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
