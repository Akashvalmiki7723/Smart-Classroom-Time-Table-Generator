'use client';

import { useEffect, useState } from 'react';
import { Button, Badge, Loading, Modal, Input, Select } from '@/components/ui';

interface Leave {
  _id: string;
  leaveType: 'casual' | 'sick' | 'earned' | 'duty' | 'other';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: { name: string; email: string };
  approvalDate?: string;
  rejectionReason?: string;
  createdAt: string;
}

interface LeaveBalance {
  casual: { total: number; taken: number; remaining: number };
  sick: { total: number; taken: number; remaining: number };
  earned: { total: number; taken: number; remaining: number };
}

export default function FacultyLeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyModal, setApplyModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const fetchLeaves = async () => {
    try {
      const response = await fetch(`/api/faculty/leaves?status=${statusFilter}`);
      if (response.ok) {
        const data = await response.json();
        setLeaves(data.leaves || []);
        setLeaveBalance(data.leaveBalance || null);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    setError('');

    try {
      const response = await fetch('/api/faculty/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaveForm),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Leave application submitted successfully!');
        setApplyModal(false);
        setLeaveForm({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
        fetchLeaves();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to apply for leave');
      }
    } catch {
      setError('Failed to apply for leave');
    } finally {
      setApplying(false);
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    if (!confirm('Are you sure you want to cancel this leave request?')) return;

    try {
      const response = await fetch(`/api/faculty/leaves/${leaveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });

      if (response.ok) {
        setSuccess('Leave cancelled successfully!');
        fetchLeaves();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      alert('Failed to cancel leave');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      approved: 'success',
      pending: 'warning',
      rejected: 'danger',
      cancelled: 'info',
    };
    return <Badge variant={variants[status] || 'info'}>{status}</Badge>;
  };

  const getLeaveTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      casual: 'bg-blue-100 text-blue-800',
      sick: 'bg-red-100 text-red-800 ',
      earned: 'bg-green-100 text-green-800 ',
      duty: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800  ',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || colors.other}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const calculateDays = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <Loading text="Loading leaves..." />;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Leave Management</h1>
          <p className="text-[var(--text-secondary)]">Apply for leave and view history</p>
        </div>
        <Button onClick={() => setApplyModal(true)}>+ Apply for Leave</Button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6">
          {success}
        </div>
      )}

      {/* Leave Balance */}
      {leaveBalance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[var(--surface)] rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Casual Leave</h3>
              <span className="text-2xl"></span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-blue-600">
                {leaveBalance.casual.remaining}
              </span>
              <span className="text-[var(--text-muted)] mb-1">
                / {leaveBalance.casual.total} remaining
              </span>
            </div>
            <div className="mt-2 bg-gray-200  rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(leaveBalance.casual.remaining / leaveBalance.casual.total) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-[var(--surface)] rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Sick Leave</h3>
              <span className="text-2xl">🏥</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-red-600">
                {leaveBalance.sick.remaining}
              </span>
              <span className="text-[var(--text-muted)] mb-1">
                / {leaveBalance.sick.total} remaining
              </span>
            </div>
            <div className="mt-2 bg-gray-200  rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${(leaveBalance.sick.remaining / leaveBalance.sick.total) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-[var(--surface)] rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Earned Leave</h3>
              <span className="text-2xl"></span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-green-600">
                {leaveBalance.earned.remaining}
              </span>
              <span className="text-[var(--text-muted)] mb-1">
                / {leaveBalance.earned.total} remaining
              </span>
            </div>
            <div className="mt-2 bg-gray-200  rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(leaveBalance.earned.remaining / leaveBalance.earned.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4 mb-6">
        <label className="text-sm text-[var(--text-secondary)]">Filter by status:</label>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      {/* Leave History */}
      <div className="bg-[var(--surface)] rounded-xl shadow">
        <div className="p-6 border-b border-[var(--border-light)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Leave History</h2>
        </div>

        {leaves.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4"></div>
            <p className="text-[var(--text-muted)]">No leave records found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {leaves.map((leave) => (
              <div key={leave._id} className="p-4 hover:bg-gray-50 /50">
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      {getLeaveTypeBadge(leave.leaveType)}
                      {getStatusBadge(leave.status)}
                      <span className="text-sm text-[var(--text-muted)]">
                        {calculateDays(leave.startDate, leave.endDate)} day(s)
                      </span>
                    </div>
                    <div className="text-sm text-[var(--text-primary)] mb-1">
                      <span className="font-medium">Duration:</span>{' '}
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      <span className="font-medium">Reason:</span> {leave.reason}
                    </div>
                    {leave.rejectionReason && (
                      <div className="text-sm text-red-600 mt-1">
                        <span className="font-medium">Rejection reason:</span> {leave.rejectionReason}
                      </div>
                    )}
                    {leave.approvedBy && leave.status === 'approved' && (
                      <div className="text-sm text-green-600 mt-1">
                        <span className="font-medium">Approved by:</span> {leave.approvedBy.name}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-[var(--text-muted)]">
                      Applied: {formatDate(leave.createdAt)}
                    </span>
                    {leave.status === 'pending' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCancelLeave(leave._id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <Modal isOpen={applyModal} onClose={() => setApplyModal(false)} title="Apply for Leave">
        <form onSubmit={handleApplyLeave}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">
                Leave Type *
              </label>
              <Select
                value={leaveForm.leaveType}
                onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                required
              >
                <option value="casual">Casual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="earned">Earned Leave</option>
                <option value="duty">Duty Leave</option>
                <option value="other">Other</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700  mb-1">
                  Start Date *
                </label>
                <Input
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700  mb-1">
                  End Date *
                </label>
                <Input
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  min={leaveForm.startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {leaveForm.startDate && leaveForm.endDate && (
              <div className="bg-gray-50  rounded-lg p-3 text-sm">
                <span className="font-medium">Duration:</span>{' '}
                {calculateDays(leaveForm.startDate, leaveForm.endDate)} day(s)
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">
                Reason *
              </label>
              <textarea
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-[var(--purple)] focus:border-transparent  "
                placeholder="Enter reason for leave..."
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-[var(--border-light)]">
            <Button type="button" variant="secondary" onClick={() => setApplyModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={applying}>
              {applying ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
