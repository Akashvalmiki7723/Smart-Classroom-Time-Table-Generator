'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/Card';
import { Loading } from '@/components/ui';
import { CircleCheck } from 'lucide-react';

interface Batch {
  _id: string;
  name: string;
  year: number;
  semester: number;
  division: string;
  studentCount: number;
}

const highlights = [
  { id: 1, feature: 'AI-optimized scheduling with conflict resolution' },
  { id: 2, feature: 'Faculty preferences and availability considered' },
  { id: 3, feature: 'Room capacity and facility matching' },
];

export default function NewTimetablePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [formData, setFormData] = useState({
    name: '', batch: '', academicYear: '2024-2025', semester: '1',
  });

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

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
      setFormData({ ...formData, batch: batchId });
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
        body: JSON.stringify({ ...formData, semester: parseInt(formData.semester) }),
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

  if (loading) return <Loading text="Loading..." />;

  return (
    <div className="flex items-start justify-center p-6 lg:p-10">
      <form onSubmit={handleSubmit} className="sm:mx-auto sm:max-w-7xl w-full">
        <div className="mb-2">
          <Link href="/coordinator/timetables" className="text-sm text-primary hover:underline hover:underline-offset-4">← Back to Timetables</Link>
        </div>
        <h3 className="text-xl font-semibold text-foreground">Create New Timetable</h3>

        {error && (
          <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="mt-6 lg:col-span-7">
            <div className="space-y-4 md:space-y-6">
              <div className="md:flex md:items-start md:space-x-4">
                <div className="md:w-full">
                  <Label htmlFor="batch" className="font-medium">
                    Select Batch<span className="text-red-500">*</span>
                  </Label>
                  <Select id="batch" className="mt-2" value={formData.batch}
                    onChange={(e) => handleBatchChange(e.target.value)}>
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
                      <Link href="/coordinator/batches/new" className="underline">Create a batch first</Link>
                    </p>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">
                    The timetable will be generated for the selected batch
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="ttName" className="font-medium">
                  Timetable Name<span className="text-red-500">*</span>
                </Label>
                <Input id="ttName" className="mt-2" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., 3rd Year Div A Timetable" />
              </div>
              <div className="md:flex md:items-start md:space-x-4">
                <div className="md:w-1/2">
                  <Label htmlFor="academicYear" className="font-medium">Academic Year<span className="text-red-500">*</span></Label>
                  <Select id="academicYear" className="mt-2" value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
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
            </div>
          </div>
          <div className="lg:col-span-5">
            <Card className="bg-muted">
              <CardContent>
                <h4 className="text-sm font-semibold text-foreground">
                  Smart Timetable Generation
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Our AI-powered system will automatically generate an optimized timetable
                  considering faculty availability, room capacity, and scheduling constraints.
                </p>
                <ul className="mt-4 space-y-1">
                  {highlights.map((item) => (
                    <li key={item.id} className="flex items-center space-x-2 py-1.5 text-foreground">
                      <CircleCheck className="h-5 w-5 text-primary" />
                      <span className="truncate text-sm">{item.feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={() => router.push('/coordinator/timetables')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving} disabled={saving || !formData.batch}>
            {saving ? 'Creating...' : 'Create & Continue →'}
          </Button>
        </div>
      </form>
    </div>
  );
}
