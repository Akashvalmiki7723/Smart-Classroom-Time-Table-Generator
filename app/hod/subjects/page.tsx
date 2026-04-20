'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

interface Subject { _id: string; name: string; code: string; type: string; credits: number; hoursPerWeek: number; department?: { name: string }; }

export default function HodSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/subjects');
        if (res.ok) { const d = await res.json(); setSubjects(d.subjects || []); }
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Subjects</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Department subjects overview</p>
      </div>
      {subjects.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--cream)' }}>
            <BookOpen className="w-8 h-8" style={{ color: 'var(--purple)' }} />
          </div>
          <p style={{ color: 'var(--text-muted)' }}>No subjects found.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  {['Code', 'Name', 'Type', 'Credits', 'Hours/Week'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)', background: 'var(--cream)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subjects.map(s => (
                  <tr key={s._id} className="hover:bg-[#FAF6F2] transition-colors" style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td className="py-3 px-4 text-sm font-semibold" style={{ color: 'var(--purple)' }}>{s.code}</td>
                    <td className="py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                        style={s.type === 'practical' ? { background: '#EEF5F0', color: '#4A7A5A' } : { background: 'var(--lavender-light)', color: 'var(--purple-dark)' }}>{s.type}</span>
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{s.credits}</td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{s.hoursPerWeek}</td>
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
