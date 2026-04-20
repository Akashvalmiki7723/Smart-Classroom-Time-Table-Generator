'use client';

import { useEffect, useState } from 'react';
import { Mail, Shield } from 'lucide-react';

export default function StudentProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) { const d = await res.json(); setUser(d?.user || null); }
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Profile & Settings</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Your account information</p>
      </div>
      <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center gap-5 mb-6 pb-6" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--purple), var(--lavender))' }}>
            {user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'S'}
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Student'}</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Student</p>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { icon: <Mail className="w-4 h-4" />, label: 'Email', value: user?.email || '—' },
            { icon: <Shield className="w-4 h-4" />, label: 'Role', value: 'Student' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--cream)', color: 'var(--text-muted)' }}>{item.icon}</div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
