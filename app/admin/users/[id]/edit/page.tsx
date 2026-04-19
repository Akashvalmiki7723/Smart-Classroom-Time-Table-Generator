'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loading } from '@/components/ui';
import Link from 'next/link';

interface Department {
  _id: string;
  name: string;
  code: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: { _id: string };
  phone?: string;
  employeeId?: string;
  isActive: boolean;
}

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'hod', label: 'HOD' },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'student', label: 'Student' },
];

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: '',
    phone: '',
    employeeId: '',
    isActive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, deptRes] = await Promise.all([
          fetch(`/api/users/${id}`),
          fetch('/api/departments?all=true'),
        ]);

        const userData = await userRes.json();
        const deptData = await deptRes.json();

        if (userRes.ok && userData.user) {
          const user: User = userData.user;
          setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            department: user.department?._id || '',
            phone: user.phone || '',
            employeeId: user.employeeId || '',
            isActive: user.isActive,
          });
        } else {
          setError('User not found');
        }

        if (deptRes.ok) {
          setDepartments(deptData.departments);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete (updateData as Record<string, unknown>).password;
      }

      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin/users');
      } else {
        setError(data.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center p-6 lg:p-10">
      <form onSubmit={handleSubmit} className="sm:mx-auto sm:max-w-5xl w-full">
        <div className="mb-2">
          <Link href="/admin/users" className="text-sm text-primary hover:underline hover:underline-offset-4">
            ← Back to Users
          </Link>
        </div>
        <h3 className="text-xl font-semibold text-foreground">Edit User</h3>
        <p className="mt-1 text-sm text-muted-foreground">Update user account details.</p>

        {error && (
          <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Separator className="my-8" />

        {/* Personal Information */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h4 className="font-medium text-foreground">Personal Information</h4>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Update the user&apos;s identity details.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="space-y-4 md:space-y-6">
              <div className="md:flex md:items-start md:space-x-4">
                <div className="md:w-1/2">
                  <Label htmlFor="name" className="font-medium">Full Name<span className="text-red-500">*</span></Label>
                  <Input id="name" className="mt-2" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" />
                </div>
                <div className="mt-4 md:mt-0 md:w-1/2">
                  <Label htmlFor="email" className="font-medium">Email<span className="text-red-500">*</span></Label>
                  <Input id="email" type="email" className="mt-2" required value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@college.edu" />
                </div>
              </div>
              <div className="md:flex md:items-start md:space-x-4">
                <div className="md:w-1/2">
                  <Label htmlFor="phone" className="font-medium">Phone</Label>
                  <Input id="phone" type="tel" className="mt-2" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 9876543210" />
                </div>
                <div className="mt-4 md:mt-0 md:w-1/2">
                  <Label htmlFor="employeeId" className="font-medium">Employee/Student ID</Label>
                  <Input id="employeeId" className="mt-2" value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} placeholder="EMP001 or STU001" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-10" />

        {/* Account Settings */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h4 className="font-medium text-foreground">Account Settings</h4>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Manage credentials, role assignment and department.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="space-y-4 md:space-y-6">
              <div>
                <Label htmlFor="password" className="font-medium">New Password</Label>
                <Input id="password" type="password" className="mt-2" value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Leave blank to keep current" />
                <p className="mt-2 text-sm text-muted-foreground">Only fill this if you want to change the password.</p>
              </div>
              <div className="md:flex md:items-start md:space-x-4">
                <div className="md:w-1/2">
                  <Label htmlFor="role" className="font-medium">Role<span className="text-red-500">*</span></Label>
                  <Select id="role" className="mt-2" required options={roleOptions} value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
                </div>
                <div className="mt-4 md:mt-0 md:w-1/2">
                  <Label htmlFor="department" className="font-medium">Department</Label>
                  <Select id="department" className="mt-2" value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                    <option value="">No Department</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                    ))}
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
                      <p className="font-medium text-foreground text-sm">Active Account</p>
                      <p className="text-xs text-muted-foreground">Inactive accounts cannot log in to the system.</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="ghost" onClick={() => router.push('/admin/users')}>Cancel</Button>
          <Button type="submit" isLoading={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
}
