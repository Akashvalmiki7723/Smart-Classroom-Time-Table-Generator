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

const facilityOptions = [
  'Projector', 'Whiteboard', 'Smart Board', 'AC',
  'Computer', 'Speaker', 'Mic', 'Video Conferencing', 'Lab Equipment',
];

export default function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', building: '', floor: '',
    type: 'lecture', capacity: '',
    facilities: [] as string[],
    isAvailable: true, isShared: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`/api/coordinator/rooms/${id}`);
        if (response.ok) {
          const room = await response.json();
          setFormData({
            name: room.name, building: room.building, floor: room.floor,
            type: room.type, capacity: room.capacity.toString(),
            facilities: room.facilities || [],
            isAvailable: room.isAvailable, isShared: !room.department,
          });
        } else {
          setError('Room not found');
        }
      } catch {
        setError('Failed to fetch room');
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
      const response = await fetch(`/api/coordinator/rooms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, capacity: parseInt(formData.capacity) }),
      });
      const data = await response.json();
      if (response.ok) {
        router.push('/coordinator/rooms');
      } else {
        setError(data.error || 'Failed to update room');
      }
    } catch {
      setError('Failed to update room');
    } finally {
      setSaving(false);
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

  if (loading) return <Loading text="Loading room..." />;

  return (
    <div className="flex items-start justify-center p-6 lg:p-10">
      <form onSubmit={handleSubmit} className="sm:mx-auto sm:max-w-5xl w-full">
        <div className="mb-2">
          <Link href="/coordinator/rooms" className="text-sm text-primary hover:underline hover:underline-offset-4">← Back to Rooms</Link>
        </div>
        <h3 className="text-xl font-semibold text-foreground">Edit Room</h3>
        <p className="mt-1 text-sm text-muted-foreground">Update room information.</p>

        {error && (
          <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Separator className="my-8" />

        {/* Room Details */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h4 className="font-medium text-foreground">Room Details</h4>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Basic location and configuration.</p>
          </div>
          <div className="md:col-span-2">
            <div className="space-y-4 md:space-y-6">
              <div className="md:flex md:items-start md:space-x-4">
                <div className="md:w-1/2">
                  <Label htmlFor="roomName" className="font-medium">Room Name/Number<span className="text-red-500">*</span></Label>
                  <Input id="roomName" className="mt-2" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Room 101" />
                </div>
                <div className="mt-4 md:mt-0 md:w-1/2">
                  <Label htmlFor="building" className="font-medium">Building<span className="text-red-500">*</span></Label>
                  <Input id="building" className="mt-2" required value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })} placeholder="e.g., Main Building" />
                </div>
              </div>
              <div className="md:flex md:items-start md:space-x-4">
                <div className="md:w-1/3">
                  <Label htmlFor="floor" className="font-medium">Floor<span className="text-red-500">*</span></Label>
                  <Input id="floor" className="mt-2" required value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })} placeholder="e.g., Ground, 1" />
                </div>
                <div className="mt-4 md:mt-0 md:w-1/3">
                  <Label htmlFor="roomType" className="font-medium">Type</Label>
                  <Select id="roomType" className="mt-2" value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                    <option value="lecture">Lecture Hall</option>
                    <option value="lab">Laboratory</option>
                    <option value="seminar">Seminar Room</option>
                    <option value="workshop">Workshop</option>
                  </Select>
                </div>
                <div className="mt-4 md:mt-0 md:w-1/3">
                  <Label htmlFor="capacity" className="font-medium">Capacity<span className="text-red-500">*</span></Label>
                  <Input id="capacity" type="number" className="mt-2" required value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} placeholder="60" min="1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-10" />

        {/* Facilities & Status */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h4 className="font-medium text-foreground">Facilities & Status</h4>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Equipment and availability.</p>
          </div>
          <div className="md:col-span-2">
            <div className="space-y-6">
              <div>
                <Label className="font-medium">Facilities</Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {facilityOptions.map((facility) => (
                    <button key={facility} type="button" onClick={() => toggleFacility(facility)}
                      className={`relative cursor-pointer rounded-md border px-4 py-2 text-sm font-medium transition ${
                        formData.facilities.includes(facility)
                          ? 'border-primary/20 bg-primary/5 text-primary ring-2 ring-primary/20'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
                      }`}>
                      {facility}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="relative block cursor-pointer rounded-md border border-border bg-background px-6 py-4 transition hover:bg-muted/50">
                  <div className="flex items-center space-x-4">
                    <input type="checkbox" checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-ring" />
                    <div>
                      <p className="font-medium text-foreground text-sm">Available for scheduling</p>
                      <p className="text-xs text-muted-foreground">Uncheck to temporarily disable this room.</p>
                    </div>
                  </div>
                </label>
                <label className="relative block cursor-pointer rounded-md border border-border bg-background px-6 py-4 transition hover:bg-muted/50">
                  <div className="flex items-center space-x-4">
                    <input type="checkbox" checked={formData.isShared}
                      onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-ring" />
                    <div>
                      <p className="font-medium text-foreground text-sm">Shared room</p>
                      <p className="text-xs text-muted-foreground">Available to all departments.</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="ghost" onClick={() => router.push('/coordinator/rooms')}>Cancel</Button>
          <Button type="submit" isLoading={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
}
