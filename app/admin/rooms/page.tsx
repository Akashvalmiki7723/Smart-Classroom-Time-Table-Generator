'use client';

import React, { useEffect, useState } from 'react';
import Loading from '@/components/ui/Loading';

interface Room {
  _id: string; name: string; building: string; floor: number;
  capacity: number; type: 'lecture' | 'lab' | 'seminar' | 'workshop';
  department?: { _id: string; name: string; code: string };
  hasProjector: boolean; hasAC: boolean; isActive: boolean;
}

const TYPE_STYLES: Record<string, React.CSSProperties> = {
  lecture:  { background: 'var(--teal-light)',     color: 'var(--teal-dark)' },
  lab:      { background: '#EEF5F0',               color: '#4A7A5A' },
  seminar:  { background: 'var(--lavender-light)', color: 'var(--purple-dark)' },
  workshop: { background: '#FEF3E2',               color: '#B8720A' },
};
const STAT_STYLES = [
  { type: 'lecture',  label: 'Lecture Rooms', color: 'var(--teal-dark)',   bg: 'var(--teal-light)' },
  { type: 'lab',      label: 'Labs',          color: '#4A7A5A',            bg: '#EEF5F0' },
  { type: 'seminar',  label: 'Seminar Halls', color: 'var(--purple-dark)', bg: 'var(--lavender-light)' },
  { type: 'workshop', label: 'Workshops',     color: '#B8720A',            bg: '#FEF3E2' },
];
const selectStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: '10px', fontSize: '13px',
  border: '1.5px solid var(--border)', background: 'var(--cream-light)',
  color: 'var(--text-primary)', outline: 'none',
};

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('');

  useEffect(() => { fetchRooms(); }, [filterType, filterBuilding]);

  const fetchRooms = async () => {
    try {
      let url = '/api/rooms?';
      if (filterType) url += `type=${filterType}&`;
      if (filterBuilding) url += `building=${filterBuilding}`;
      const res = await fetch(url);
      if (res.ok) { const d = await res.json(); setRooms(d.rooms || []); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const buildings = [...new Set(rooms.map(r => r.building))];
  const grouped = rooms.reduce((acc, room) => {
    const b = room.building || 'Unknown';
    if (!acc[b]) acc[b] = [];
    acc[b].push(room);
    return acc;
  }, {} as Record<string, Room[]>);

  if (loading) return <Loading size="lg" text="Loading rooms..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Rooms</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Manage classrooms, labs, and other facilities</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold" style={{ color: 'var(--purple)' }}>{rooms.length}</span>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Rooms</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_STYLES.map(({ type, label, color, bg }) => (
          <div key={type} className="rounded-2xl p-4" style={{ background: bg, border: '1px solid var(--border-light)' }}>
            <p className="text-2xl font-bold" style={{ color }}>{rooms.filter(r => r.type === type).length}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={selectStyle}>
            <option value="">All Types</option>
            <option value="lecture">Lecture</option>
            <option value="lab">Lab</option>
            <option value="seminar">Seminar</option>
            <option value="workshop">Workshop</option>
          </select>
          <select value={filterBuilding} onChange={e => setFilterBuilding(e.target.value)} style={selectStyle}>
            <option value="">All Buildings</option>
            {buildings.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Rooms by Building */}
      {Object.entries(grouped).map(([building, buildingRooms]) => (
        <div key={building} className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="px-6 py-4" style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-light)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {building}
              <span className="ml-2 font-normal" style={{ color: 'var(--text-muted)' }}>({buildingRooms.length} rooms)</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {buildingRooms.map(room => (
              <div key={room._id} className="rounded-xl p-4 transition-all hover:-translate-y-0.5"
                style={{ border: '1px solid var(--border)', background: 'var(--cream-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{room.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize" style={TYPE_STYLES[room.type] || {}}>{room.type}</span>
                </div>
                <div className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <p>Floor {room.floor}</p>
                  <p>Capacity: {room.capacity}</p>
                  {room.department && <p>{room.department.name}</p>}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {room.hasProjector && <span className="px-2 py-0.5 rounded-full" style={{ background: 'var(--teal-light)', color: 'var(--teal-dark)' }}>Projector</span>}
                    {room.hasAC && <span className="px-2 py-0.5 rounded-full" style={{ background: 'var(--lavender-light)', color: 'var(--purple-dark)' }}>AC</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {rooms.length === 0 && (
        <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No rooms found</p>
        </div>
      )}
    </div>
  );
}
