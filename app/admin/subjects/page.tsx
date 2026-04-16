'use client';

import React, { useEffect, useState } from 'react';
import Loading from '@/components/ui/Loading';

interface Subject {
  _id: string; code: string; name: string;
  department: { _id: string; name: string; code: string };
  semester: number; credits: number;
  type: 'theory' | 'practical';
  assignedFaculty?: { _id: string; name: string; email: string };
  isActive: boolean;
}
interface Department { _id: string; name: string; code: string; }

const typeStyle = (type: string): React.CSSProperties =>
  type === 'theory'
    ? { background: 'var(--teal-light)', color: 'var(--teal-dark)' }
    : { background: 'var(--lavender-light)', color: 'var(--purple-dark)' };

const selectStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: '10px', fontSize: '13px',
  border: '1.5px solid var(--border)', background: 'var(--cream-light)',
  color: 'var(--text-primary)', outline: 'none',
};

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchSubjects(); fetchDepartments(); }, [filterDept, filterSemester]);

  const fetchSubjects = async () => {
    try {
      let url = '/api/subjects?';
      if (filterDept) url += `department=${filterDept}&`;
      if (filterSemester) url += `semester=${filterSemester}`;
      const res = await fetch(url);
      if (res.ok) { const d = await res.json(); setSubjects(d.subjects || []); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      if (res.ok) { const d = await res.json(); setDepartments(d.departments || []); }
    } catch (e) { console.error(e); }
  };

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const grouped = filtered.reduce((acc, s) => {
    const k = s.department?.name || 'Unknown';
    if (!acc[k]) acc[k] = [];
    acc[k].push(s);
    return acc;
  }, {} as Record<string, Subject[]>);

  if (loading) return <Loading size="lg" text="Loading subjects..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Subjects</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Manage all subjects across departments</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold" style={{ color: 'var(--purple)' }}>{subjects.length}</span>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Subjects</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input type="text" placeholder="Search subjects..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...selectStyle }} />
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={selectStyle}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)} style={selectStyle}>
            <option value="">All Semesters</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
      </div>

      {/* Grouped by Department */}
      {Object.entries(grouped).map(([deptName, deptSubjects]) => (
        <div key={deptName} className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="px-6 py-4" style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-light)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {deptName}
              <span className="ml-2 font-normal" style={{ color: 'var(--text-muted)' }}>({deptSubjects.length} subjects)</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--cream-light)', borderBottom: '1px solid var(--border-light)' }}>
                  {['Code','Name','Semester','Credits','Type','Faculty'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deptSubjects.map(s => (
                  <tr key={s._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td className="px-5 py-3.5 text-xs font-bold" style={{ color: 'var(--purple)' }}>{s.code}</td>
                    <td className="px-5 py-3.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>Sem {s.semester}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{s.credits}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize" style={typeStyle(s.type)}>{s.type}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>{s.assignedFaculty?.name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No subjects found</p>
        </div>
      )}
    </div>
  );
}
