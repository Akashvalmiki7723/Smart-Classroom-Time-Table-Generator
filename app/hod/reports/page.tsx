'use client';

import { useEffect, useState } from 'react';
import { BarChart3, BookOpen, CalendarDays, Clock } from 'lucide-react';

export default function HodReportsPage() {
  const [data, setData] = useState<any>(null);
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
        setData({
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

  const cards = [
    { title: 'Total Subjects', value: data?.subjects || 0, icon: <BookOpen className="w-5 h-5" />, color: 'var(--purple)' },
    { title: 'Total Timetables', value: data?.timetables || 0, icon: <CalendarDays className="w-5 h-5" />, color: 'var(--teal-dark)' },
    { title: 'Published', value: data?.published || 0, icon: <BarChart3 className="w-5 h-5" />, color: '#4A7A5A' },
    { title: 'Pending', value: data?.pending || 0, icon: <Clock className="w-5 h-5" />, color: '#B8720A' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Reports</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Department statistics and reports</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
    </div>
  );
}
