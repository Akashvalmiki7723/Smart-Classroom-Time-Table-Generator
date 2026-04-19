'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loading } from '@/components/ui';

export default function EditBatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', year: '1', semester: '1',
    division: '', studentCount: '',
    academicYear: '2024-2025', isActive: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`/api/coordinator/batches/${id}`);
        if (response.ok) {
          const batch = await response.json();
          setFormData({
            name: batch.name, year: batch.year.toString(),
            semester: batch.semester.toString(), division: batch.division,
            studentCount: batch.studentCount.toString(),
            academicYear: batch.academicYear, isActive: batch.isActive,
          });
        } else {
          setError('Batch not found');
        }
      } catch {
        setError('Failed to fetch batch');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/coordinator/batches/${id}`, {
        method: 'PUT',
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
        setError(data.error || 'Failed to update batch');
      }
    } catch {
      setError('Failed to update batch');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading text="Loading batch..." />;

  return (
    <div className="flex items-start justify-center p-6 lg:p-10">
      <form onSubmit={handleSubmit} className="sm:mx-auto sm:max-w-5xl w-full">
        <div className="mb-2">
          <Link href="/coordinator/batches" className="text-sm text-primary hover:underline hover:underline-offset-4">← Back to Batches</Link>
        </div>
        <h3 className="text-xl font-semibold text-foreground">Edit Batch</h3>
        <p className="mt-1 text-sm text-muted-foreground">Update batch information.</p>

        {error && (
          <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Separator className="my-8" />

        {/* Batch Info */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h4 className="font-medium text-foreground">Batch Information</h4>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Name and identifier.</p>
          </div>
          <div className="md:col-span-2">
            <div>
              <Label htmlFor="batchName" className="font-medium">Batch Name<span className="text-red-500">*</span></Label>
              <Input id="batchName" className="mt-2" required value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 3rd Year - Sem 5 - Div A" />
            </div>
          </div>
        </div>

        <Separator className="my-10" />

        {/* Academic Details */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h4 className="font-medium text-foreground">Academic Details</h4>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Year, semester, division and count.</p>
          </div>
          <div className="md:col-span-2">
            <div className="space-y-4 md:space-y-6">
              <div className="md:flex md:items-start md:space-x-4">
                <div className="md:w-1/2">
                  <Label htmlFor="year" className="font-medium">Year<span className="text-red-500">*</span></Label>
                  <Select id="year" className="mt-2" value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </Select>
                </div>
                <div className="mt-4 md:mt-0 md:w-1/2">
                  <Label htmlFor="semester" className="font-medium">Semester<span className="text-red-500">*</span></Label>
                  <Select id="semester" className="mt-2" value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="md:flex md:items-start md:space-x-4">
                <div className="md:w-1/3">
                  <Label htmlFor="division" className="font-medium">Division<span className="text-red-500">*</span></Label>
                  <Input id="division" className="mt-2" required value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value.toUpperCase() })}
                    placeholder="A" maxLength={2} />
                </div>
                <div className="mt-4 md:mt-0 md:w-1/3">
                  <Label htmlFor="studentCount" className="font-medium">Student Count<span className="text-red-500">*</span></Label>
                  <Input id="studentCount" type="number" className="mt-2" required value={formData.studentCount}
                    onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })} placeholder="60" min="1" />
                </div>
                <div className="mt-4 md:mt-0 md:w-1/3">
                  <Label htmlFor="academicYear" className="font-medium">Academic Year</Label>
                  <Select id="academicYear" className="mt-2" value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                  </Select>
                </div>
              </div>
              <div>
                <label className="relative block cursor-pointer rounded-md border border-border bg-background px-6 py-4 transition hover:bg-muted/50">
                  <div className="flex items-center space-x-4">
                    <input type="checkbox" checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-ring" />
                    <div>
                      <p className="font-medium text-foreground text-sm">Active batch</p>
                      <p className="text-xs text-muted-foreground">Inactive batches are hidden from scheduling.</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="ghost" onClick={() => router.push('/coordinator/batches')}>Cancel</Button>
          <Button type="submit" isLoading={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
}
