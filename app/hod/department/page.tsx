'use client';

import { useEffect, useState } from 'react';
import { Building2, Users, BookOpen } from 'lucide-react';

interface Department { _id: string; name: string; code: string; description?: string; }

export default function HodDepartmentPage() {
  const [dept, setDept] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/departments');
        if (res.ok) { const d = await res.json(); setDept(d.departments?.[0] || null); }
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Department</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Department information and details</p>
      </div>
      {dept ? (
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--purple), var(--lavender))' }}>
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{dept.name}</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Code: {dept.code}</p>
            </div>
          </div>
          {dept.description && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{dept.description}</p>}
        </div>
      ) : (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No department information available.</p>
        </div>
      )}
    </div>
  );
}
