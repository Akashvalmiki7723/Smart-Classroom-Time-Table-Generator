'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';

interface Timetable { _id: string; name: string; status: string; academicYear: string; semester: number; batch?: { name: string }; updatedAt: string; }

const statusStyles: Record<string, React.CSSProperties> = {
  published: { background: '#EEF5F0', color: '#4A7A5A' },
  approved: { background: '#EEF5F0', color: '#4A7A5A' },
  pending: { background: '#FEF3E2', color: '#B8720A' },
  draft: { background: 'var(--cream)', color: 'var(--text-secondary)' },
  rejected: { background: '#FFF0F2', color: '#C0445A' },
};

export default function HodTimetablesPage() {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/timetables');
        if (res.ok) { const d = await res.json(); setTimetables(d.timetables || []); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid var(--border-light)', borderTopColor: 'var(--purple)' }} />
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Timetables</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>View and manage department timetables</p>
      </div>
      {timetables.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--cream)' }}>
            <CalendarDays className="w-8 h-8" style={{ color: 'var(--purple)' }} />
          </div>
          <p style={{ color: 'var(--text-muted)' }}>No timetables found for your department.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  {['Name', 'Batch', 'Semester', 'Year', 'Status', 'Updated'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)', background: 'var(--cream)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timetables.map(tt => (
                  <tr key={tt._id} className="hover:bg-[#FAF6F2] transition-colors" style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td className="py-3.5 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{tt.name}</td>
                    <td className="py-3.5 px-4 text-sm" style={{ color: 'var(--text-muted)' }}>{tt.batch?.name || '—'}</td>
                    <td className="py-3.5 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{tt.semester}</td>
                    <td className="py-3.5 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{tt.academicYear}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                        style={statusStyles[tt.status] || statusStyles.draft}>{tt.status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(tt.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
