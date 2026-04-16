'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';

interface Timetable {
  _id: string; name: string;
  department: { _id: string; name: string; code: string };
  batch?: { _id: string; name: string; year: number; division: string };
  academicYear: string; semester: number;
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected';
  createdBy: { name: string };
  approvedBy?: { name: string }; createdAt: string;
}
interface Department { _id: string; name: string; code: string; }

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  published: { background: '#EEF5F0',               color: '#4A7A5A' },
  approved:  { background: 'var(--teal-light)',     color: 'var(--teal-dark)' },
  pending:   { background: '#FEF9E7',               color: '#B8720A' },
  rejected:  { background: '#FFF0F2',               color: '#C0445A' },
  draft:     { background: 'var(--cream)',           color: 'var(--text-secondary)' },
};
const STAT_CARDS = [
  { key: 'published', label: 'Published', color: '#4A7A5A',            bg: '#EEF5F0' },
  { key: 'approved',  label: 'Approved',  color: 'var(--teal-dark)',   bg: 'var(--teal-light)' },
  { key: 'pending',   label: 'Pending',   color: '#B8720A',            bg: '#FEF9E7' },
  { key: 'draft',     label: 'Drafts',    color: 'var(--text-secondary)', bg: 'var(--cream)' },
];
const selectStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: '10px', fontSize: '13px',
  border: '1.5px solid var(--border)', background: 'var(--cream-light)',
  color: 'var(--text-primary)', outline: 'none',
};

export default function AdminTimetablesPage() {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { fetchTimetables(); fetchDepartments(); }, [filterDept, filterStatus]);

  const fetchTimetables = async () => {
    try {
      let url = '/api/timetables?';
      if (filterDept) url += `department=${filterDept}&`;
      if (filterStatus) url += `status=${filterStatus}`;
      const res = await fetch(url);
      if (res.ok) { const d = await res.json(); setTimetables(d.timetables || []); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      if (res.ok) { const d = await res.json(); setDepartments(d.departments || []); }
    } catch (e) { console.error(e); }
  };

  const counts = STAT_CARDS.reduce((acc, c) => {
    acc[c.key] = timetables.filter(t => t.status === c.key).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) return <Loading size="lg" text="Loading timetables..." />;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Timetables</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>View and manage all timetables across departments</p>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, color, bg }) => (
          <div key={key} className="rounded-2xl p-4" style={{ background: bg, border: '1px solid var(--border-light)' }}>
            <p className="text-2xl font-bold" style={{ color }}>{counts[key] || 0}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={selectStyle}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-light)' }}>
                {['Timetable','Department','Batch','Semester','Status','Created By',''].map((h, i) => (
                  <th key={i} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timetables.map(t => (
                <tr key={t._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.academicYear}</div>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{t.department?.name}</td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {t.batch ? `Year ${t.batch.year} – ${t.batch.division}` : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>Sem {t.semester}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize" style={STATUS_STYLES[t.status]}>{t.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{t.createdBy?.name}</td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/timetables/${t._id}`} className="text-xs font-semibold" style={{ color: 'var(--purple)' }}>View →</Link>
                  </td>
                </tr>
              ))}
              {timetables.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No timetables found. Timetables are created by coordinators.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
