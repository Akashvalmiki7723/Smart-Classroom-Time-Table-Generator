'use client';

import { useEffect, useState } from 'react';
import { Button, Badge, Loading } from '@/components/ui';

interface TimeSlot {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  slotNumber: number;
}

interface ScheduleEntry {
  slot: number;
  slotName: string;
  startTime: string;
  endTime: string;
  subject: { _id: string; name: string; code: string; type: string } | null;
  room: { _id: string; name: string; building: string; floor: string } | null;
  batch: { _id: string; name: string; year: number; semester: number; division: string } | null;
  type: string;
  timetableName: string;
}

type ScheduleMap = Record<number, ScheduleEntry[]>;

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function FacultySchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleMap>({});
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await fetch('/api/faculty/schedule?view=week');
      if (response.ok) {
        const data = await response.json();
        setSchedule(data.schedule || {});
        setTimeSlots(data.timeSlots || []);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEntryForSlot = (day: number, slotNumber: number): ScheduleEntry | undefined => {
    return schedule[day]?.find((entry) => entry.slot === slotNumber);
  };

  const getTotalClassesForDay = (day: number): number => {
    return schedule[day]?.length || 0;
  };

  const getTotalClasses = (): number => {
    return Object.values(schedule).reduce((sum, entries) => sum + entries.length, 0);
  };

  if (loading) {
    return <Loading text="Loading schedule..." />;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Schedule</h1>
          <p className="text-[var(--text-secondary)]">
            {getTotalClasses()} classes this week
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'calendar' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            Calendar View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        /* Calendar View */
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 ">
                  <th className="border border-gray-200  p-3 text-left text-sm font-medium text-gray-500  w-24">
                    Time
                  </th>
                  {DAYS.map((day, index) => (
                    <th
                      key={day}
                      className="border border-gray-200  p-3 text-center text-sm font-medium text-gray-500 "
                    >
                      <div>{day}</div>
                      <div className="text-xs font-normal">
                        {getTotalClassesForDay(index)} classes
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot) => (
                  <tr key={slot._id}>
                    <td className="border border-gray-200  p-3 bg-gray-50 ">
                      <div className="text-sm font-medium text-[var(--text-primary)]">
                        {slot.name}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {slot.startTime} - {slot.endTime}
                      </div>
                    </td>
                    {DAYS.map((_, dayIndex) => {
                      const entry = getEntryForSlot(dayIndex, slot.slotNumber);
                      return (
                        <td
                          key={dayIndex}
                          className="border border-gray-200  p-2 min-w-[150px]"
                        >
                          {entry ? (
                            <div
                              className={`p-2 rounded-lg text-xs ${
                                entry.type === 'practical'
                                  ? 'bg-green-100 border border-green-200'
                                  : 'bg-indigo-100  border border-indigo-200'
                              }`}
                            >
                              <div className="font-semibold text-[var(--text-primary)] mb-1">
                                {entry.subject?.code || 'N/A'}
                              </div>
                              <div className="text-[var(--text-secondary)] truncate">
                                {entry.subject?.name || 'Unknown'}
                              </div>
                              <div className="mt-1 flex items-center gap-1">
                                <span className="text-gray-500 ">
                                  📍 {entry.room?.name || 'TBA'}
                                </span>
                              </div>
                              <div className="text-gray-500 ">
                                {entry.batch?.name || 'N/A'}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-gray-400 py-4">
                              -
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
      ) : (
        /* List View */
        <div className="space-y-6">
          {DAYS.map((day, dayIndex) => {
            const daySchedule = schedule[dayIndex] || [];
            return (
              <div key={day} className="bg-[var(--surface)] rounded-xl shadow">
                <div className="p-4 border-b border-[var(--border-light)] flex justify-between items-center">
                  <h3 className="font-semibold text-[var(--text-primary)]">{day}</h3>
                  <Badge variant="info">{daySchedule.length} classes</Badge>
                </div>

                {daySchedule.length === 0 ? (
                  <div className="p-8 text-center text-[var(--text-muted)]">
                    No classes scheduled
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {daySchedule.sort((a, b) => a.slot - b.slot).map((entry, index) => (
                      <div key={index} className="p-4 hover:bg-gray-50 /50">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-24 text-center">
                            <div className="text-sm font-medium text-[var(--text-primary)]">
                              {entry.startTime}
                            </div>
                            <div className="text-xs text-[var(--text-muted)]">
                              {entry.endTime}
                            </div>
                          </div>

                          <div
                            className={`w-1 h-14 rounded-full ${
                              entry.type === 'practical' ? 'bg-green-500' : 'bg-indigo-500'
                            }`}
                          ></div>

                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-[var(--text-primary)]">
                                {entry.subject?.code || 'N/A'}
                              </span>
                              <Badge
                                variant={entry.type === 'practical' ? 'success' : 'info'}
                                size="sm"
                              >
                                {entry.type}
                              </Badge>
                            </div>
                            <div className="text-sm text-[var(--text-secondary)]">
                              {entry.subject?.name || 'Unknown Subject'}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-medium text-[var(--text-primary)]">
                              {entry.room?.name || 'TBA'}
                            </div>
                            <div className="text-xs text-[var(--text-muted)]">
                              {entry.room?.building}
                              {entry.room?.floor && `, Floor ${entry.room.floor}`}
                            </div>
                          </div>

                          <div className="text-right min-w-[100px]">
                            <div className="text-sm font-medium text-[var(--text-primary)]">
                              {entry.batch?.name || 'N/A'}
                            </div>
                            <div className="text-xs text-[var(--text-muted)]">
                              Year {entry.batch?.year}, Sem {entry.batch?.semester}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 bg-[var(--surface)] rounded-xl shadow p-4">
        <h4 className="font-medium text-[var(--text-primary)] mb-3">Legend</h4>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-indigo-100  border border-indigo-200"></div>
            <span className="text-sm text-[var(--text-secondary)]">Theory Class</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
            <span className="text-sm text-[var(--text-secondary)]">Practical/Lab</span>
          </div>
        </div>
      </div>
    </div>
  );
}
