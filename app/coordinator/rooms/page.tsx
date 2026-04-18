'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Input, Select, Badge, Loading, Modal } from '@/components/ui';

interface Room {
  _id: string;
  name: string;
  building: string;
  floor: string;
  type: 'lecture' | 'lab' | 'seminar' | 'workshop';
  capacity: number;
  facilities: string[];
  department?: { name: string; code: string };
  isAvailable: boolean;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; room: Room | null }>({
    open: false,
    room: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [typeFilter, buildingFilter]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);
      if (buildingFilter) params.append('building', buildingFilter);

      const response = await fetch(`/api/coordinator/rooms?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms);
        setBuildings(data.buildings);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRooms();
  };

  const handleDelete = async () => {
    if (!deleteModal.room) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/coordinator/rooms/${deleteModal.room._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRooms(rooms.filter((r) => r._id !== deleteModal.room?._id));
        setDeleteModal({ open: false, room: null });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room');
    } finally {
      setDeleting(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
      lecture: 'info',
      lab: 'success',
      seminar: 'warning',
      workshop: 'danger',
    };
    return <Badge variant={variants[type] || 'info'}>{type}</Badge>;
  };

  if (loading && rooms.length === 0) {
    return <Loading text="Loading rooms..." />;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Room Management
          </h1>
          <p className="text-[var(--text-secondary)]">
            Manage classrooms and labs for scheduling
          </p>
        </div>
        <Link href="/coordinator/rooms/new">
          <Button>+ Add Room</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-[var(--surface)] rounded-xl shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search rooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="lecture">Lecture</option>
              <option value="lab">Lab</option>
              <option value="seminar">Seminar</option>
              <option value="workshop">Workshop</option>
            </Select>
          </div>
          <div className="w-40">
            <Select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
            >
              <option value="">All Buildings</option>
              {buildings.map((building) => (
                <option key={building} value={building}>
                  {building}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      {/* Rooms Grid */}
      {rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-[var(--surface)] rounded-xl shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    {room.name}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    {room.building}, Floor {room.floor}
                  </p>
                </div>
                {getTypeBadge(room.type)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-[var(--text-muted)] w-24">Capacity:</span>
                  <span className="text-[var(--text-primary)] font-medium">
                    {room.capacity} seats
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-[var(--text-muted)] w-24">Status:</span>
                  <Badge variant={room.isAvailable ? 'success' : 'danger'}>
                    {room.isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                {room.department && (
                  <div className="flex items-center text-sm">
                    <span className="text-[var(--text-muted)] w-24">Dept:</span>
                    <span className="text-[var(--text-primary)]">
                      {room.department.code}
                    </span>
                  </div>
                )}
              </div>

              {room.facilities.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-[var(--text-muted)] mb-2">
                    Facilities:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {room.facilities.map((facility) => (
                      <span
                        key={facility}
                        className="px-2 py-0.5 bg-gray-100  text-gray-600  text-xs rounded"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-[var(--border-light)]">
                <Link href={`/coordinator/rooms/${room._id}/edit`} className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  onClick={() => setDeleteModal({ open: true, room })}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--surface)] rounded-xl shadow p-12 text-center">
          <p className="text-[var(--text-muted)] mb-4">
            No rooms found. Start by adding a room.
          </p>
          <Link href="/coordinator/rooms/new">
            <Button>+ Add Room</Button>
          </Link>
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, room: null })}
        title="Delete Room"
      >
        <p className="text-[var(--text-secondary)] mb-6">
          Are you sure you want to delete{' '}
          <strong>{deleteModal.room?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4">
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ open: false, room: null })}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
