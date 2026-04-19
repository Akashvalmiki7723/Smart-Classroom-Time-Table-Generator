'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Loading } from '@/components/ui';
import Link from 'next/link';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  hod?: { _id: string };
  isActive: boolean;
}

export default function EditDepartmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hodUsers, setHodUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', code: '', description: '', hod: '', isActive: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const [deptRes, hodRes] = await Promise.all([
          fetch(`/api/departments/${id}`),
          fetch('/api/users?role=hod&limit=100'),
        ]);
        const deptData = await deptRes.json();
        const hodData = await hodRes.json();

        if (deptRes.ok && deptData.department) {
          const dept: Department = deptData.department;
          setFormData({
            name: dept.name, code: dept.code,
            description: dept.description || '', hod: dept.hod?._id || '',
            isActive: dept.isActive,
          });
        } else {
          setError('Department not found');
        }
        if (hodRes.ok) setHodUsers(hodData.users);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load department data');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        router.push('/admin/departments');
      } else {
        setError(data.error || 'Failed to update department');
      }
    } catch (error) {
      console.error('Error updating department:', error);
      setError('Failed to update department');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loading size="lg" /></div>;

  return (
    <div className="flex items-start justify-center p-6 lg:p-10">
      <form onSubmit={handleSubmit} className="sm:mx-auto sm:max-w-5xl w-full">
        <div className="mb-2">
          <Link href="/admin/departments" className="text-sm text-primary hover:underline hover:underline-offset-4">← Back to Departments</Link>
        </div>
        <h3 className="text-xl font-semibold text-foreground">Edit Department</h3>
        <p className="mt-1 text-sm text-muted-foreground">Update department details and settings.</p>

        {error && (
          <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Separator className="my-8" />

        {/* Department Details */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h4 className="font-medium text-foreground">Department Details</h4>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Core information about the department.</p>
          </div>
          <div className="md:col-span-2">
            <div className="space-y-4 md:space-y-6">
              <div className="md:flex md:items-start md:space-x-4">
                <div className="md:w-3/4">
                  <Label htmlFor="deptName" className="font-medium">Department Name<span className="text-red-500">*</span></Label>
                  <Input id="deptName" className="mt-2" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Computer Science and Engineering" />
                </div>
                <div className="mt-4 md:mt-0 md:w-1/4">
                  <Label htmlFor="deptCode" className="font-medium">Code<span className="text-red-500">*</span></Label>
                  <Input id="deptCode" className="mt-2" required value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="CSE" />
                  <p className="mt-2 text-sm text-muted-foreground">Short unique code</p>
                </div>
              </div>
              <div>
                <Label htmlFor="description" className="font-medium">Description</Label>
                <Textarea id="description" className="mt-2" rows={3} value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the department" />
                <p className="mt-2 text-sm text-muted-foreground">Optional description for internal reference.</p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-10" />

        {/* Administration */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h4 className="font-medium text-foreground">Administration</h4>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">HOD assignment and status.</p>
          </div>
          <div className="md:col-span-2">
            <div className="space-y-4 md:space-y-6">
              <div>
                <Label htmlFor="hod" className="font-medium">Head of Department (HOD)</Label>
                <Select id="hod" className="mt-2" value={formData.hod}
                  onChange={(e) => setFormData({ ...formData, hod: e.target.value })}>
                  <option value="">No HOD Assigned</option>
                  {hodUsers.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="relative block cursor-pointer rounded-md border border-border bg-background px-6 py-4 transition hover:bg-muted/50">
                  <div className="flex items-center space-x-4">
                    <input type="checkbox" checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-ring" />
                    <div>
                      <p className="font-medium text-foreground text-sm">Active Department</p>
                      <p className="text-xs text-muted-foreground">Inactive departments won&apos;t appear in selections.</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="ghost" onClick={() => router.push('/admin/departments')}>Cancel</Button>
          <Button type="submit" isLoading={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
}
