'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Select } from '@/components/ui';

export default function NewBatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    year: '1',
    semester: '1',
    division: '',
    studentCount: '',
    academicYear: '2024-2025',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/coordinator/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          year: parseInt(formData.year),
          semester: parseInt(formData.semester),
          studentCount: parseInt(formData.studentCount),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/coordinator/batches');
      } else {
        setError(data.error || 'Failed to create batch');
      }
    } catch {
      setError('Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate batch name
  const generateName = () => {
    const yearSuffix = ['st', 'nd', 'rd', 'th'];
    const yearStr = `${formData.year}${yearSuffix[parseInt(formData.year) - 1] || 'th'}`;
    return `${yearStr} Year - Sem ${formData.semester} - Div ${formData.division || 'A'}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <Link
          href="/coordinator/batches"
          className="text-[var(--purple)] hover:opacity-80 text-sm mb-2 inline-block"
        >
          ← Back to Batches
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Add New Batch
        </h1>
        <p className="text-[var(--text-secondary)]">
          Create a new student batch
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[var(--surface)] rounded-xl shadow p-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700  mb-2">
              Batch Name *
            </label>
            <div className="flex gap-2">
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 3rd Year - Sem 5 - Div A"
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFormData({ ...formData, name: generateName() })}
              >
                Auto
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">
              Year *
            </label>
            <Select
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              required
            >
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
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

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">
              Division *
            </label>
            <Input
              value={formData.division}
              onChange={(e) => setFormData({ ...formData, division: e.target.value.toUpperCase() })}
              placeholder="e.g., A, B, C"
              maxLength={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">
              Student Count *
            </label>
            <Input
              type="number"
              value={formData.studentCount}
              onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
              placeholder="e.g., 60"
              min="1"
              required
            />
          </div>

          <div className="md:col-span-2">
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
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[var(--border-light)]">
          <Link href="/coordinator/batches">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Batch'}
          </Button>
        </div>
      </form>
    </div>
  );
}
