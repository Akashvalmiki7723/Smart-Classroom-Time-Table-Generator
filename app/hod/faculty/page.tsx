'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

interface FacultyMember { _id: string; name: string; email: string; }

export default function HodFacultyPage() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Use the faculty stats endpoint which is accessible to faculty/hod
        const res = await fetch('/api/faculty/subjects');
        if (res.ok) {
          const d = await res.json();
          // Extract unique faculty from subjects data
          setFaculty(d.subjects?.map((s: any) => s.faculty).filter(Boolean).flat() || []);
        }
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Faculty Members</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>View faculty in your department</p>
      </div>
      {faculty.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--cream)' }}>
            <Users className="w-8 h-8" style={{ color: 'var(--purple)' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Faculty Data</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Faculty information will appear here once timetables are configured.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {faculty.map(f => (
            <div key={f._id} className="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, var(--purple), var(--lavender))' }}>
                  {f.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{f.name}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.email || 'Faculty'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
