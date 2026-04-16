'use client';

import React, { useEffect, useState } from 'react';
import Loading from '@/components/ui/Loading';

interface TimeSlot {
  _id: string; name: string; startTime: string; endTime: string;
  slotNumber: number; type: 'theory' | 'practical' | 'break' | 'lunch';
  duration: number; isActive: boolean;
}

const TYPE_STYLES: Record<string, React.CSSProperties> = {
  theory:    { background: 'var(--teal-light)',     color: 'var(--teal-dark)' },
  practical: { background: 'var(--lavender-light)', color: 'var(--purple-dark)' },
  lunch:     { background: '#FEF3E2',               color: '#B8720A' },
  break:     { background: 'var(--cream)',           color: 'var(--text-secondary)' },
};
const ROW_BG: Record<string, string> = {
  lunch: '#FEF9E7', break: 'var(--cream-light)',
};

export default function AdminTimeSlotsPage() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/time-slots')
      .then(r => r.json())
      .then(d => { setTimeSlots(d.timeSlots || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading size="lg" text="Loading time slots..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Time Slots</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Manage class periods and breaks schedule</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold" style={{ color: 'var(--purple)' }}>{timeSlots.length}</span>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Slots</p>
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Daily Schedule Timeline</h2>
        <div className="space-y-2">
          {timeSlots.map(slot => (
            <div key={slot._id} className="flex items-center gap-4 p-4 rounded-xl"
              style={{ background: ROW_BG[slot.type] || 'var(--cream-light)', border: '1px solid var(--border-light)' }}>
              <div className="w-28 text-center flex-shrink-0">
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{slot.startTime}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>to</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{slot.endTime}</p>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{slot.name}</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{slot.duration} minutes</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize" style={TYPE_STYLES[slot.type]}>{slot.type}</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--cream)', color: 'var(--text-secondary)' }}>#{slot.slotNumber}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Time Slot Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-light)' }}>
                {['Slot #','Name','Start','End','Duration','Type'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(slot => (
                <tr key={slot._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td className="px-5 py-3.5 text-sm font-bold" style={{ color: 'var(--purple)' }}>{slot.slotNumber}</td>
                  <td className="px-5 py-3.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{slot.name}</td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{slot.startTime}</td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{slot.endTime}</td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{slot.duration} min</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize" style={TYPE_STYLES[slot.type]}>{slot.type}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {timeSlots.length === 0 && (
        <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No time slots configured</p>
        </div>
      )}
    </div>
  );
}
