'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Input, Select, Badge, Loading, Modal } from '@/components/ui';

interface Batch {
  _id: string;
  name: string;
  department: { name: string; code: string };
  year: number;
  semester: number;
  division: string;
  studentCount: number;
  academicYear: string;
  isActive: boolean;
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; batch: Batch | null }>({
    open: false,
    batch: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, [yearFilter, semesterFilter]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (yearFilter) params.append('year', yearFilter);
      if (semesterFilter) params.append('semester', semesterFilter);

      const response = await fetch(`/api/coordinator/batches?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBatches(data.batches);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBatches();
  };

  const handleDelete = async () => {
    if (!deleteModal.batch) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/coordinator/batches/${deleteModal.batch._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBatches(batches.filter((b) => b._id !== deleteModal.batch?._id));
        setDeleteModal({ open: false, batch: null });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete batch');
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
      alert('Failed to delete batch');
    } finally {
      setDeleting(false);
    }
  };

  if (loading && batches.length === 0) {
    return <Loading text="Loading batches..." />;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Batch Management
          </h1>
          <p className="text-[var(--text-secondary)]">
            Manage student batches for scheduling
          </p>
        </div>
        <Link href="/coordinator/batches/new">
          <Button>+ Add Batch</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-[var(--surface)] rounded-xl shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search batches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-32">
            <Select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </Select>
          </div>
          <div className="w-40">
            <Select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      {/* Batches Table */}
      {batches.length > 0 ? (
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 ">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  Batch Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  Year / Semester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  Division
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  Academic Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {batches.map((batch) => (
                <tr key={batch._id} className="hover:bg-gray-50 /50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[var(--text-primary)]">
                      {batch.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[var(--text-primary)]">
                      Year {batch.year} / Sem {batch.semester}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[var(--text-primary)]">
                      {batch.division}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[var(--text-primary)]">
                      {batch.studentCount}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[var(--text-secondary)]">
                      {batch.academicYear}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={batch.isActive ? 'success' : 'danger'}>
                      {batch.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link href={`/coordinator/batches/${batch._id}/edit`}>
                        <Button variant="secondary" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteModal({ open: true, batch })}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[var(--surface)] rounded-xl shadow p-12 text-center">
          <p className="text-[var(--text-muted)] mb-4">
            No batches found. Start by adding a batch.
          </p>
          <Link href="/coordinator/batches/new">
            <Button>+ Add Batch</Button>
          </Link>
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, batch: null })}
        title="Delete Batch"
      >
        <p className="text-[var(--text-secondary)] mb-6">
          Are you sure you want to delete{' '}
          <strong>{deleteModal.batch?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4">
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ open: false, batch: null })}
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
