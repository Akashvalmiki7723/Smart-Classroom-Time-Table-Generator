'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

interface Department {
  _id: string;
  name: string;
  code: string;
}

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'hod', label: 'HOD' },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'student', label: 'Student' },
];

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'faculty',
    department: '',
    phone: '',
    employeeId: '',
    isActive: true,
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch('/api/departments?all=true');
        const data = await res.json();
        if (res.ok) {
          setDepartments(data.departments);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin/users');
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-start justify-center p-6 lg:p-10">
      <form onSubmit={handleSubmit} className="sm:mx-auto sm:max-w-5xl w-full">
        {/* Page header */}
        <div className="mb-2">
          <Link href="/admin/users" className="text-sm text-primary hover:underline hover:underline-offset-4">
            ← Back to Users
          </Link>
        </div>
        <h3 className="text-xl font-semibold text-foreground">
          Add New User
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new user account in the system.
        </p>

        {error && (
          <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Separator className="my-8" />

        {/* Section 1: Personal Information */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h4 className="font-medium text-foreground">Personal Information</h4>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Basic identity details for the new user account.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="space-y-4 md:space-y-6">
              <div className="md:flex md:items-start md:space-x-4">
                <div className="md:w-1/2">
                  <Label htmlFor="name" className="font-medium">
                    Full Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    className="mt-2"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="mt-4 md:mt-0 md:w-1/2">
                  <Label htmlFor="email" className="font-medium">
                    Email<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    className="mt-2"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@college.edu"
                  />
                </div>
              </div>
              <div className="md:flex md:items-start md:space-x-4">
                <div className="md:w-1/2">
                  <Label htmlFor="phone" className="font-medium">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="mt-2"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div className="mt-4 md:mt-0 md:w-1/2">
                  <Label htmlFor="employeeId" className="font-medium">Employee/Student ID</Label>
                  <Input
                    id="employeeId"
                    className="mt-2"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="EMP001 or STU001"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-10" />

        {/* Section 2: Account Settings */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h4 className="font-medium text-foreground">Account Settings</h4>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Configure credentials, role assignment and department.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="space-y-4 md:space-y-6">
              <div>
                <Label htmlFor="password" className="font-medium">
                  Password<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  className="mt-2"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  Must be at least 6 characters long.
                </p>
              </div>
              <div className="md:flex md:items-start md:space-x-4">
                <div className="md:w-1/2">
                  <Label htmlFor="role" className="font-medium">
                    Role<span className="text-red-500">*</span>
                  </Label>
                  <Select
                    id="role"
                    className="mt-2"
                    required
                    options={roleOptions}
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
                <div className="mt-4 md:mt-0 md:w-1/2">
                  <Label htmlFor="department" className="font-medium">Department</Label>
                  <Select
                    id="department"
                    className="mt-2"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="">Select Department (optional)</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                    ))}
                  </Select>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Assign to a department if applicable
                  </p>
                </div>
              </div>
              <div>
                <label className="relative block cursor-pointer rounded-md border border-border bg-background px-6 py-4 transition hover:bg-muted/50">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                    />
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

        {/* Footer actions */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/admin/users')}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>
    </div>
  );
}
