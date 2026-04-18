'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Select, Badge, Loading, Modal } from '@/components/ui';

interface Timetable {
  _id: string;
  name: string;
  batch?: { name: string; year: number; semester: number; division: string };
  academicYear: string;
  semester: number;
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected';
  entries: unknown[];
  createdBy: { name: string };
  approvedBy?: { name: string };
  hardConstraintViolations: number;
  softConstraintViolations: number;
  createdAt: string;
  updatedAt: string;
}

export default function TimetablesPage() {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; timetable: Timetable | null }>({
    open: false,
    timetable: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTimetables();
  }, [statusFilter]);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/coordinator/timetables?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTimetables(data.timetables);
      }
    } catch (error) {
      console.error('Error fetching timetables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.timetable) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/coordinator/timetables/${deleteModal.timetable._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTimetables(timetables.filter((t) => t._id !== deleteModal.timetable?._id));
        setDeleteModal({ open: false, timetable: null });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete timetable');
      }
    } catch (error) {
      console.error('Error deleting timetable:', error);
      alert('Failed to delete timetable');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      published: 'success',
      approved: 'success',
      pending: 'warning',
      draft: 'info',
      rejected: 'danger',
    };
    return <Badge variant={variants[status] || 'info'}>{status}</Badge>;
  };

  if (loading && timetables.length === 0) {
    return <Loading text="Loading timetables..." />;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Timetables
          </h1>
          <p className="text-[var(--text-secondary)]">
            Create and manage timetables
          </p>
        </div>
        <Link href="/coordinator/timetables/new">
          <Button>+ Create Timetable</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-[var(--surface)] rounded-xl shadow p-4 mb-6">
        <div className="flex gap-4">
          <div className="w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Timetables Grid */}
      {timetables.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timetables.map((timetable) => (
            <div
              key={timetable._id}
              className="bg-[var(--surface)] rounded-xl shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    {timetable.name}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    {timetable.academicYear} - Sem {timetable.semester}
                  </p>
                </div>
                {getStatusBadge(timetable.status)}
              </div>

              <div className="space-y-2 mb-4">
                {timetable.batch && (
                  <div className="flex items-center text-sm">
                    <span className="text-[var(--text-muted)] w-20">Batch:</span>
                    <span className="text-[var(--text-primary)]">
                      {timetable.batch.name}
                    </span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <span className="text-[var(--text-muted)] w-20">Entries:</span>
                  <span className="text-[var(--text-primary)]">
                    {timetable.entries?.length || 0} classes
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-[var(--text-muted)] w-20">Created:</span>
                  <span className="text-[var(--text-primary)]">
                    {new Date(timetable.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Violations */}
              {(timetable.hardConstraintViolations > 0 || timetable.softConstraintViolations > 0) && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600">
                    {timetable.hardConstraintViolations} hard,{' '}
                    {timetable.softConstraintViolations} soft conflicts
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-[var(--border-light)]">
                <Link href={`/coordinator/timetables/${timetable._id}`} className="flex-1">
                  <Button variant="secondary" className="w-full">
                    View/Edit
                  </Button>
                </Link>
                {timetable.status !== 'published' && (
                  <Button
                    variant="danger"
                    onClick={() => setDeleteModal({ open: true, timetable })}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--surface)] rounded-xl shadow p-12 text-center">
          <div className="text-6xl mb-4"></div>
          <p className="text-[var(--text-muted)] mb-4">
            No timetables found. Create your first timetable to get started.
          </p>
          <Link href="/coordinator/timetables/new">
            <Button>+ Create Timetable</Button>
          </Link>
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, timetable: null })}
        title="Delete Timetable"
      >
        <p className="text-[var(--text-secondary)] mb-6">
          Are you sure you want to delete{' '}
          <strong>{deleteModal.timetable?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4">
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ open: false, timetable: null })}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
