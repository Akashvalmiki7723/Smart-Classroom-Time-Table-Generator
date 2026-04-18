'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Select } from '@/components/ui';

const facilityOptions = [
  'Projector',
  'Whiteboard',
  'Smart Board',
  'AC',
  'Computer',
  'Speaker',
  'Mic',
  'Video Conferencing',
  'Lab Equipment',
];

export default function NewRoomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    floor: '',
    type: 'lecture',
    capacity: '',
    facilities: [] as string[],
    isShared: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/coordinator/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/coordinator/rooms');
      } else {
        setError(data.error || 'Failed to create room');
      }
    } catch {
      setError('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const toggleFacility = (facility: string) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <Link
          href="/coordinator/rooms"
          className="text-[var(--purple)] hover:opacity-80 text-sm mb-2 inline-block"
        >
          ← Back to Rooms
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Add New Room
        </h1>
        <p className="text-[var(--text-secondary)]">
          Create a new classroom or lab
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
          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">
              Room Name/Number *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Room 101, Lab A1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">
              Building *
            </label>
            <Input
              value={formData.building}
              onChange={(e) => setFormData({ ...formData, building: e.target.value })}
              placeholder="e.g., Main Building, Block A"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">
              Floor *
            </label>
            <Input
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              placeholder="e.g., Ground, 1, 2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">
              Type *
            </label>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="lecture">Lecture Hall</option>
              <option value="lab">Laboratory</option>
              <option value="seminar">Seminar Room</option>
              <option value="workshop">Workshop</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">
              Capacity (seats) *
            </label>
            <Input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="e.g., 60"
              min="1"
              required
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isShared}
                onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
                className="w-4 h-4 text-[var(--purple)] border-gray-300 rounded focus:ring-[var(--purple)]"
              />
              <span className="ml-2 text-sm text-gray-700 ">
                Shared room (available to all departments)
              </span>
            </label>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700  mb-2">
            Facilities
          </label>
          <div className="flex flex-wrap gap-2">
            {facilityOptions.map((facility) => (
              <button
                key={facility}
                type="button"
                onClick={() => toggleFacility(facility)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  formData.facilities.includes(facility)
                    ? 'bg-[var(--purple)] text-white'
                    : 'bg-gray-100  text-gray-700  hover:bg-gray-200'
                }`}
              >
                {facility}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[var(--border-light)]">
          <Link href="/coordinator/rooms">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Room'}
          </Button>
        </div>
      </form>
    </div>
  );
}
