'use client';

import { useEffect, useState } from 'react';
import { DoorOpen, Search, Users, MapPin, Building2 } from 'lucide-react';

interface Room {
  _id: string; name: string; building: string; floor: string;
  capacity: number; type: string;
  department?: { _id: string; name: string; code: string };
  facilities?: string[];
}

export default function StudentRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/rooms');
        if (res.ok) { const d = await res.json(); setRooms(d.rooms || []); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid var(--border-light)', borderTopColor: 'var(--purple)' }} />
    </div>
  );

  const types = [...new Set(rooms.map(r => r.type))];
  const filtered = rooms.filter(r => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.building.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || r.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Classrooms</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Browse available rooms and their details</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search rooms..." className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
            style={{ border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none' }} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm"
          style={{ border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }}>
          <option value="">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Room Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--cream)' }}>
            <DoorOpen className="w-8 h-8" style={{ color: 'var(--purple)' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Rooms Found</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(room => (
            <div key={room._id} className="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: room.type === 'lab' ? 'var(--teal-light)' : 'var(--lavender-light)',
                    color: room.type === 'lab' ? 'var(--teal-dark)' : 'var(--purple-dark)' }}>
                  <DoorOpen className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                  style={room.type === 'lab'
                    ? { background: '#EEF5F0', color: '#4A7A5A' }
                    : { background: 'var(--lavender-light)', color: 'var(--purple-dark)' }}>
                  {room.type}
                </span>
              </div>
              <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{room.name}</h3>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <Building2 className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  {room.building}, Floor {room.floor}
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <Users className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  Capacity: {room.capacity}
                </div>
                {room.department && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    {room.department.name}
                  </div>
                )}
              </div>
              {room.facilities && room.facilities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                  {room.facilities.map(f => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--cream)', color: 'var(--text-muted)' }}>{f}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
