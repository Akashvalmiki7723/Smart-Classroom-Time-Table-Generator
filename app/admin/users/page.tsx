'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button, Card, Input, Select, Table, Badge, Loading, Modal } from '@/components/ui';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: { _id: string; name: string; code: string };
  isActive: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'hod', label: 'HOD' },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'student', label: 'Student' },
];

const roleBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  admin: 'error',
  hod: 'warning',
  coordinator: 'info',
  faculty: 'success',
  student: 'default',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);

      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();

      if (res.ok) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${deleteModal.user._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDeleteModal({ open: false, user: null });
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (user: User) => (
        <div>
          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{user.name}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{user.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (user: User) => (
        <Badge variant={roleBadgeVariant[user.role] || 'default'}>
          {user.role.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (user: User) => (
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {user.department?.name || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (user: User) => (
        <Badge variant={user.isActive ? 'success' : 'error'}>
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/users/${user._id}/edit`}>
            <Button variant="ghost" size="sm">Edit</Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setDeleteModal({ open: true, user })}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>User Management</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Manage all system users</p>
          </div>
          <Link href="/admin/users/new"><Button>+ Add New User</Button></Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={roleOptions}
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </Card>

      {/* Users Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No users found</p>
          </div>
        ) : (
          <>
            <Table columns={columns} data={users} />
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between p-4" style={{ borderTop: '1px solid var(--border-light)' }}>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} users
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, user: null })}
        title="Delete User"
      >
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to delete <strong>{deleteModal.user?.name}</strong>? 
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setDeleteModal({ open: false, user: null })}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete User'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
