'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface TimetableEntry {
  day: number;
  slot: number;
  subject: { _id: string; name: string; code: string };
  faculty: { _id: string; name: string };
  room: { _id: string; name: string; building: string };
  batch: { _id: string; name: string };
  type: 'theory' | 'practical';
}

interface Timetable {
  _id: string;
  name: string;
  department: { _id: string; name: string; code: string };
  batch?: { _id: string; name: string; year: number; division: string; semester: number };
  academicYear: string;
  semester: number;
  status: string;
  entries: TimetableEntry[];
  createdBy: { name: string };
  approvedBy?: { name: string };
  createdAt: string;
}

interface TimeSlot {
  _id: string;
  slotNumber: number;
  name: string;
  startTime: string;
  endTime: string;
  type: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TimetableDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchTimetable();
      fetchTimeSlots();
    }
  }, [params.id]);

  const fetchTimetable = async () => {
    try {
      const res = await fetch(`/api/timetables/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setTimetable(data.timetable);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const res = await fetch('/api/time-slots');
      if (res.ok) {
        const data = await res.json();
        setTimeSlots(data.timeSlots || []);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  };

  const getEntryForSlot = (day: number, slotNumber: number) => {
    return timetable?.entries.find((e) => e.day === day && e.slot === slotNumber);
  };

  const getSlotInfo = (slotNumber: number) => {
    return timeSlots.find((ts) => ts.slotNumber === slotNumber);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!timetable) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Timetable not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-blue-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline text-sm mb-2"
          >
            ← Back to timetables
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{timetable.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span> {timetable.department?.name}</span>
            <span> {timetable.academicYear}</span>
            <span> Semester {timetable.semester}</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                timetable.status === 'published'
                  ? 'bg-green-100 text-green-800'
                  : timetable.status === 'approved'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {timetable.status}
            </span>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-24">
                  Time
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot.slotNumber}>
                  <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 bg-gray-50 dark:bg-gray-700">
                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                      {slot.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </td>
                  {slot.type === 'lunch' ? (
                    <td
                      colSpan={5}
                      className="border border-gray-200 dark:border-gray-600 px-4 py-4 text-center bg-orange-50 dark:bg-orange-900/20"
                    >
                      <span className="text-orange-600 dark:text-orange-400 font-medium">
                         Lunch Break
                      </span>
                    </td>
                  ) : (
                    DAYS.map((_, dayIndex) => {
                      const entry = getEntryForSlot(dayIndex, slot.slotNumber);
                      return (
                        <td
                          key={dayIndex}
                          className={`border border-gray-200 dark:border-gray-600 px-2 py-2 ${
                            entry
                              ? entry.type === 'practical'
                                ? 'bg-green-50 dark:bg-green-900/20'
                                : 'bg-blue-50 dark:bg-blue-900/20'
                              : ''
                          }`}
                        >
                          {entry ? (
                            <div className="text-xs space-y-1">
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {entry.subject?.code}
                              </div>
                              <div className="text-gray-600 dark:text-gray-400 truncate" title={entry.subject?.name}>
                                {entry.subject?.name}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400">
                                👤 {entry.faculty?.name}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400">
                                📍 {entry.room?.name}
                              </div>
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-xs ${
                                  entry.type === 'practical'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                                }`}
                              >
                                {entry.type}
                              </span>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-center text-xs">-</div>
                          )}
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timetable Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Created By</dt>
              <dd className="text-gray-900 dark:text-white">{timetable.createdBy?.name}</dd>
            </div>
            {timetable.approvedBy && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Approved By</dt>
                <dd className="text-gray-900 dark:text-white">{timetable.approvedBy?.name}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-500">Total Classes</dt>
              <dd className="text-gray-900 dark:text-white">{timetable.entries.length}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-500"></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Theory: {timetable.entries.filter((e) => e.type === 'theory').length} classes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-green-500"></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Practical: {timetable.entries.filter((e) => e.type === 'practical').length} classes
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
