'use client';

import React, { useEffect, useState } from 'react';
import Loading from '@/components/ui/Loading';

interface Batch {
  _id: string; name: string;
  department: { _id: string; name: string; code: string };
  year: number; semester: number; division: string;
  studentCount: number; academicYear: string; isActive: boolean;
}
interface Department { _id: string; name: string; code: string; }

const selectStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: '10px', fontSize: '13px',
  border: '1.5px solid var(--border)', background: 'var(--cream-light)',
  color: 'var(--text-primary)', outline: 'none',
};

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('');
  const [filterYear, setFilterYear] = useState('');

  useEffect(() => { fetchBatches(); fetchDepartments(); }, [filterDept, filterYear]);

  const fetchBatches = async () => {
    try {
      let url = '/api/batches?';
      if (filterDept) url += `department=${filterDept}&`;
      if (filterYear) url += `year=${filterYear}`;
      const res = await fetch(url);
      if (res.ok) { const d = await res.json(); setBatches(d.batches || []); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      if (res.ok) { const d = await res.json(); setDepartments(d.departments || []); }
    } catch (e) { console.error(e); }
  };

  const totalStudents = batches.reduce((s, b) => s + (b.studentCount || 0), 0);

  const grouped = batches.reduce((acc, b) => {
    const dept = b.department?.name || 'Unknown';
    if (!acc[dept]) acc[dept] = {};
    const yr = `Year ${b.year}`;
    if (!acc[dept][yr]) acc[dept][yr] = [];
    acc[dept][yr].push(b);
    return acc;
  }, {} as Record<string, Record<string, Batch[]>>);

  if (loading) return <Loading size="lg" text="Loading batches..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Batches</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Manage student batches and sections</p>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <span className="text-3xl font-bold" style={{ color: 'var(--purple)' }}>{batches.length}</span>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Batches</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold" style={{ color: 'var(--teal-dark)' }}>{totalStudents}</span>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Students</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={selectStyle}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={selectStyle}>
            <option value="">All Years</option>
            {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </div>
      </div>

      {/* Batches by Department */}
      {Object.entries(grouped).map(([deptName, years]) => (
        <div key={deptName} className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="px-6 py-4" style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-light)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{deptName}</h2>
          </div>
          <div className="p-5 space-y-5">
            {Object.entries(years).map(([yearName, yearBatches]) => (
              <div key={yearName}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>{yearName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {yearBatches.map(batch => (
                    <div key={batch._id} className="rounded-xl p-4 transition-all hover:-translate-y-0.5"
                      style={{ border: '1px solid var(--border)', background: 'var(--cream-light)', boxShadow: 'var(--shadow-sm)' }}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Section {batch.division}</h4>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'var(--teal-light)', color: 'var(--teal-dark)' }}>Sem {batch.semester}</span>
                      </div>
                      <div className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <p>{batch.studentCount} Students</p>
                        <p>{batch.academicYear}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {batches.length === 0 && (
        <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No batches found</p>
        </div>
      )}
    </div>
  );
}
