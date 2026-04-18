'use client';

import { useEffect, useState } from 'react';
import { Button, Badge, Loading, Modal, Input, Select } from '@/components/ui';

interface TimeSlot {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  slotNumber: number;
  type: 'theory' | 'practical' | 'break' | 'lunch';
  duration: number;
  isActive: boolean;
}

export default function TimeSlotsPage() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState<{ open: boolean; slot: TimeSlot | null }>({
    open: false,
    slot: null,
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; slot: TimeSlot | null }>({
    open: false,
    slot: null,
  });
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    slotNumber: '',
    type: 'theory',
    duration: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/coordinator/timeslots');
      if (response.ok) {
        const data = await response.json();
        setTimeSlots(data.timeSlots);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    try {
      setSeeding(true);
      const response = await fetch('/api/coordinator/timeslots/seed', {
        method: 'POST',
      });

      if (response.ok) {
        fetchTimeSlots();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to seed time slots');
      }
    } catch (error) {
      console.error('Error seeding time slots:', error);
      alert('Failed to seed time slots');
    } finally {
      setSeeding(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      startTime: '',
      endTime: '',
      slotNumber: '',
      type: 'theory',
      duration: '',
    });
    setError('');
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/coordinator/timeslots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slotNumber: parseInt(formData.slotNumber),
          duration: parseInt(formData.duration),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTimeSlots([...timeSlots, data].sort((a, b) => a.slotNumber - b.slotNumber));
        setAddModal(false);
        resetForm();
      } else {
        setError(data.error || 'Failed to create time slot');
      }
    } catch {
      setError('Failed to create time slot');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.slot) return;

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/coordinator/timeslots/${editModal.slot._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slotNumber: parseInt(formData.slotNumber),
          duration: parseInt(formData.duration),
          isActive: editModal.slot.isActive,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTimeSlots(
          timeSlots
            .map((s) => (s._id === editModal.slot?._id ? data : s))
            .sort((a, b) => a.slotNumber - b.slotNumber)
        );
        setEditModal({ open: false, slot: null });
        resetForm();
      } else {
        setError(data.error || 'Failed to update time slot');
      }
    } catch {
      setError('Failed to update time slot');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.slot) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/coordinator/timeslots/${deleteModal.slot._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTimeSlots(timeSlots.filter((s) => s._id !== deleteModal.slot?._id));
        setDeleteModal({ open: false, slot: null });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete time slot');
      }
    } catch (error) {
      console.error('Error deleting time slot:', error);
      alert('Failed to delete time slot');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (slot: TimeSlot) => {
    setFormData({
      name: slot.name,
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotNumber: slot.slotNumber.toString(),
      type: slot.type,
      duration: slot.duration.toString(),
    });
    setEditModal({ open: true, slot });
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
      theory: 'info',
      practical: 'success',
      break: 'warning',
      lunch: 'danger',
    };
    return <Badge variant={variants[type] || 'info'}>{type}</Badge>;
  };

  if (loading) {
    return <Loading text="Loading time slots..." />;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Time Slot Configuration
          </h1>
          <p className="text-[var(--text-secondary)]">
            Define time slots for timetable scheduling
          </p>
        </div>
        <div className="flex gap-2">
          {timeSlots.length === 0 && (
            <Button variant="secondary" onClick={handleSeedDefaults} disabled={seeding}>
              {seeding ? 'Creating...' : '⚡ Use Default Slots'}
            </Button>
          )}
          <Button onClick={() => { resetForm(); setAddModal(true); }}>
            + Add Time Slot
          </Button>
        </div>
      </div>

      {/* Time Slots Table */}
      {timeSlots.length > 0 ? (
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 ">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  Slot #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  Type
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
              {timeSlots.map((slot) => (
                <tr
                  key={slot._id}
                  className={`hover:bg-gray-50 /50 ${
                    slot.type === 'break' || slot.type === 'lunch'
                      ? 'bg-gray-50 /30'
                      : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <span className="text-lg font-bold text-[var(--purple)]">
                      {slot.slotNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[var(--text-primary)]">
                      {slot.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[var(--text-primary)]">
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[var(--text-secondary)]">
                      {slot.duration} min
                    </div>
                  </td>
                  <td className="px-6 py-4">{getTypeBadge(slot.type)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={slot.isActive ? 'success' : 'danger'}>
                      {slot.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEditModal(slot)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteModal({ open: true, slot })}
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
          <div className="text-6xl mb-4"></div>
          <p className="text-[var(--text-muted)] mb-4">
            No time slots configured. You can use default slots or add custom ones.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="secondary" onClick={handleSeedDefaults} disabled={seeding}>
              {seeding ? 'Creating...' : '⚡ Use Default Slots'}
            </Button>
            <Button onClick={() => { resetForm(); setAddModal(true); }}>
              + Add Custom Slot
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={addModal || editModal.open}
        onClose={() => {
          setAddModal(false);
          setEditModal({ open: false, slot: null });
          resetForm();
        }}
        title={editModal.open ? 'Edit Time Slot' : 'Add Time Slot'}
      >
        <form onSubmit={editModal.open ? handleEdit : handleAdd}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700  mb-1">
                Slot Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Slot 1, Lunch Break"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">
                Start Time *
              </label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">
                End Time *
              </label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">
                Slot Number *
              </label>
              <Input
                type="number"
                value={formData.slotNumber}
                onChange={(e) => setFormData({ ...formData, slotNumber: e.target.value })}
                placeholder="1"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">
                Duration (min) *
              </label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="60"
                min="15"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700  mb-1">
                Type *
              </label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="theory">Theory</option>
                <option value="practical">Practical</option>
                <option value="break">Break</option>
                <option value="lunch">Lunch</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-[var(--border-light)]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setAddModal(false);
                setEditModal({ open: false, slot: null });
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editModal.open ? 'Save Changes' : 'Add Slot'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, slot: null })}
        title="Delete Time Slot"
      >
        <p className="text-[var(--text-secondary)] mb-6">
          Are you sure you want to delete{' '}
          <strong>{deleteModal.slot?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4">
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ open: false, slot: null })}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={saving}>
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
