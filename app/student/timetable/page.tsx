'use client';

import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';

interface TimetableEntry {
  day: number; slot: number;
  subject: { _id: string; name: string; code: string } | null;
  faculty: { _id: string; name: string } | null;
  room: { _id: string; name: string; building: string; floor: string } | null;
  type: string;
}

interface TimetableInfo {
  _id: string; name: string; academicYear: string; semester: number; status: string;
  department?: { _id: string; name: string; code: string };
  entries: TimetableEntry[];
}

interface TimeSlot { _id: string; slotNumber: number; startTime: string; endTime: string; type: string; }

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StudentTimetablePage() {
  const [timetables, setTimetables] = useState<TimetableInfo[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTT, setSelectedTT] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [ttRes, tsRes] = await Promise.all([fetch('/api/timetables'), fetch('/api/time-slots')]);
        if (ttRes.ok) { const d = await ttRes.json(); setTimetables(d.timetables || []); if (d.timetables?.[0]) setSelectedTT(d.timetables[0]._id); }
        if (tsRes.ok) { const d = await tsRes.json(); setTimeSlots((d.timeSlots || []).sort((a: TimeSlot, b: TimeSlot) => a.slotNumber - b.slotNumber)); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid var(--border-light)', borderTopColor: 'var(--purple)' }} />
    </div>
  );

  const tt = timetables.find(t => t._id === selectedTT);
  const entries = tt?.entries || [];
  const getEntry = (day: number, slot: number) => entries.find(e => e.day === day && e.slot === slot);
  const slots = timeSlots.filter(ts => ts.type !== 'break');
  const todayIdx = new Date().getDay() === 0 ? -1 : new Date().getDay() - 1;

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Timetable</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>View your weekly class schedule</p>
        </div>
        {timetables.length > 1 && (
          <select value={selectedTT} onChange={e => setSelectedTT(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm" style={{ border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }}>
            {timetables.map(t => <option key={t._id} value={t._id}>{t.name} — Sem {t.semester} ({t.academicYear})</option>)}
          </select>
        )}
      </div>

      {timetables.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--cream)' }}>
            <CalendarDays className="w-8 h-8" style={{ color: 'var(--purple)' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Timetable Available</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your timetable hasn&apos;t been published yet.</p>
        </div>
      ) : (
        <>
          {tt && (
            <div className="rounded-2xl p-5 mb-6 flex flex-wrap items-center gap-6"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <div><p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Timetable</p><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{tt.name}</p></div>
              <div><p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Department</p><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{tt.department?.name || '—'}</p></div>
              <div><p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Semester</p><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{tt.semester}</p></div>
              <div><p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Year</p><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{tt.academicYear}</p></div>
              <div className="ml-auto">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize"
                  style={{ background: 'var(--teal-light)', color: 'var(--teal-dark)', border: '1px solid var(--teal)' }}>{tt.status}</span>
              </div>
            </div>
          )}

          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ background: 'var(--cream)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light)' }}>Time</th>
                    {DAYS.map((day, i) => (
                      <th key={day} className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                        style={{ background: i === todayIdx ? 'linear-gradient(135deg, #9B8EC720, #BDA6CE20)' : 'var(--cream)',
                          color: i === todayIdx ? 'var(--purple)' : 'var(--text-muted)', borderBottom: '1px solid var(--border-light)' }}>{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slots.map(slot => (
                    <tr key={slot.slotNumber}>
                      <td className="px-4 py-3 text-xs font-medium whitespace-nowrap"
                        style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-light)', background: 'var(--cream-light)' }}>
                        <div>{slot.startTime}</div><div style={{ color: 'var(--text-muted)' }}>{slot.endTime}</div>
                      </td>
                      {DAYS.map((_, di) => {
                        const entry = getEntry(di, slot.slotNumber);
                        return (
                          <td key={di} className="px-2 py-2" style={{ borderBottom: '1px solid var(--border-light)', background: di === todayIdx ? '#FAF6F2' : 'transparent' }}>
                            {entry ? (
                              <div className="rounded-xl p-2.5 transition-all hover:-translate-y-0.5"
                                style={{ background: entry.type === 'practical' ? 'linear-gradient(135deg, #EEF5F0, #D4E8EC)' : 'linear-gradient(135deg, var(--lavender-light), var(--cream))',
                                  border: `1px solid ${entry.type === 'practical' ? 'var(--teal)' : 'var(--lavender)'}` }}>
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-xs font-bold" style={{ color: entry.type === 'practical' ? '#4A7A5A' : 'var(--purple-dark)' }}>{entry.subject?.code || '—'}</span>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold capitalize"
                                    style={entry.type === 'practical' ? { background: '#D4E8EC', color: '#4A7A5A' } : { background: 'var(--lavender)', color: '#fff' }}>
                                    {entry.type === 'practical' ? 'Lab' : 'Lec'}</span>
                                </div>
                                <div className="text-[10px] font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{entry.subject?.name || '—'}</div>
                                <div className="text-[10px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{entry.room?.name || 'TBA'} • {entry.faculty?.name || '—'}</div>
                              </div>
                            ) : (
                              <div className="h-full min-h-[60px] flex items-center justify-center">
                                <span className="text-[10px]" style={{ color: 'var(--border)' }}>—</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
