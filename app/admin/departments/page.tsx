'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button, Card, Input, Table, Badge, Loading, Modal } from '@/components/ui';

interface Department {
  _id: string; name: string; code: string;
  description?: string;
  hod?: { _id: string; name: string; email: string };
  isActive: boolean; createdAt: string;
}
interface Pagination { page: number; limit: number; total: number; pages: number; }

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; department: Department | null }>({ open: false, department: null });
  const [deleting, setDeleting] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pagination.page.toString(), limit: pagination.limit.toString() });
      if (search) params.set('search', search);
      const res = await fetch(`/api/departments?${params}`);
      const data = await res.json();
      if (res.ok) { setDepartments(data.departments); setPagination(data.pagination); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const handleDelete = async () => {
    if (!deleteModal.department) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/departments/${deleteModal.department._id}`, { method: 'DELETE' });
      if (res.ok) { setDeleteModal({ open: false, department: null }); fetchDepartments(); }
      else { const d = await res.json(); alert(d.error || 'Failed to delete'); }
    } catch { alert('Failed to delete department'); } finally { setDeleting(false); }
  };

  const columns = [
    {
      key: 'name', label: 'Department',
      render: (d: Department) => (
        <div>
          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{d.name}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Code: {d.code}</div>
        </div>
      ),
    },
    {
      key: 'hod', label: 'Head of Department',
      render: (d: Department) => d.hod ? (
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{d.hod.name}</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.hod.email}</div>
        </div>
      ) : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Not assigned</span>,
    },
    {
      key: 'description', label: 'Description',
      render: (d: Department) => <span className="text-sm truncate max-w-xs block" style={{ color: 'var(--text-secondary)' }}>{d.description || '—'}</span>,
    },
    {
      key: 'status', label: 'Status',
      render: (d: Department) => <Badge variant={d.isActive ? 'success' : 'error'}>{d.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions', label: 'Actions',
      render: (d: Department) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/departments/${d._id}/edit`}><Button variant="ghost" size="sm">Edit</Button></Link>
          <Button variant="danger" size="sm" onClick={() => setDeleteModal({ open: true, department: d })}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Department Management</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Manage all departments and assign HODs</p>
        </div>
        <Link href="/admin/departments/new"><Button>+ Add Department</Button></Link>
      </div>

      <Card className="mb-6 p-5">
        <form onSubmit={(e) => { e.preventDefault(); setPagination(p => ({ ...p, page: 1 })); fetchDepartments(); }} className="flex gap-3">
          <div className="flex-1"><Input placeholder="Search by name or code..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <Button type="submit">Search</Button>
        </form>
      </Card>

      <Card>
        {loading ? <div className="flex justify-center py-12"><Loading size="lg" /></div>
          : departments.length === 0
          ? <div className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>No departments found</div>
          : (
            <>
              <Table columns={columns} data={departments} />
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between p-4" style={{ borderTop: '1px solid var(--border-light)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={pagination.page === 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={pagination.page === pagination.pages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
      </Card>

      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, department: null })} title="Delete Department">
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to delete <strong>{deleteModal.department?.name}</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModal({ open: false, department: null })}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
        </div>
      </Modal>
    </div>
  );
}
