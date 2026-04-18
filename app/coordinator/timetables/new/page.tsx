'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Select, Loading } from '@/components/ui';

interface Batch {
  _id: string;
  name: string;
  year: number;
  semester: number;
  division: string;
  studentCount: number;
}

export default function NewTimetablePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    batch: '',
    academicYear: '2024-2025',
    semester: '1',
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/coordinator/batches?active=true');
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

  const handleBatchChange = (batchId: string) => {
    const batch = batches.find((b) => b._id === batchId);
    if (batch) {
      setFormData({
        ...formData,
        batch: batchId,
        semester: batch.semester.toString(),
        name: `${batch.name} Timetable`,
      });
    } else {
      setFormData({
        ...formData,
        batch: batchId,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/coordinator/timetables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          semester: parseInt(formData.semester),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/coordinator/timetables/${data._id}`);
      } else {
        setError(data.error || 'Failed to create timetable');
      }
    } catch {
      setError('Failed to create timetable');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading text="Loading..." />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <Link
          href="/coordinator/timetables"
          className="text-[var(--purple)] hover:opacity-80 text-sm mb-2 inline-block"
        >
          ← Back to Timetables
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Create New Timetable
        </h1>
        <p className="text-[var(--text-secondary)]">
          Set up basic timetable information
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="bg-[var(--surface)] rounded-xl shadow p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[var(--purple)] text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <span className="ml-2 text-sm font-medium text-[var(--purple)]">
              Basic Info
            </span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200 " />
          <div className="flex items-center opacity-50">
            <div className="w-8 h-8 bg-gray-300 text-[var(--text-secondary)] rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <span className="ml-2 text-sm text-[var(--text-muted)]">
              Add Classes
            </span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200 " />
          <div className="flex items-center opacity-50">
            <div className="w-8 h-8 bg-gray-300 text-[var(--text-secondary)] rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <span className="ml-2 text-sm text-[var(--text-muted)]">
              Review & Submit
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[var(--surface)] rounded-xl shadow p-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">
              Select Batch *
            </label>
            <Select
              value={formData.batch}
              onChange={(e) => handleBatchChange(e.target.value)}
              required
            >
              <option value="">Choose a batch...</option>
              {batches.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.name} ({batch.studentCount} students)
                </option>
              ))}
            </Select>
            {batches.length === 0 && (
              <p className="mt-2 text-sm text-amber-600">
                No active batches found.{' '}
                <Link href="/coordinator/batches/new" className="underline">
                  Create a batch first
                </Link>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">
              Timetable Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., 3rd Year Div A Timetable"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700  mb-2">
                Academic Year *
              </label>
              <Select
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                required
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-2">
                Semester *
              </label>
              <Select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-[var(--border-light)]">
          <Link href="/coordinator/timetables">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving || !formData.batch}>
            {saving ? 'Creating...' : 'Create & Continue →'}
          </Button>
        </div>
      </form>
    </div>
  );
}
