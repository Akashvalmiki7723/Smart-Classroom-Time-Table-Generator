'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Select, Badge, Loading, Modal } from '@/components/ui';

interface ConflictInfo {
  type: 'faculty_clash' | 'room_clash' | 'batch_clash' | 'capacity' | 'gap' | 'overload';
  severity: 'hard' | 'soft';
  message: string;
  day?: number;
  slot?: number;
  entities?: string[];
}

interface GenerationStats {
  totalClasses: number;
  placedClasses: number;
  unplacedClasses: number;
  iterations: number;
  timeTaken: number;
}

interface GenerationOptions {
  maxGapsPerDay: number;
  preferConsecutiveLectures: boolean;
  balanceFacultyLoad: boolean;
  prioritizePreferredSlots: boolean;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  type: string;
  credits: number;
  lecturesPerWeek: number;
  assignedFaculty?: { _id: string; name: string; email: string };
}

interface Faculty {
  _id: string;
  name: string;
  email: string;
}

interface Room {
  _id: string;
  name: string;
  building: string;
  floor: string;
  type: string;
  capacity: number;
}

interface TimeSlot {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  slotNumber: number;
  type: string;
}

interface TimetableEntry {
  day: number;
  slot: number;
  subject: string | { _id: string; name: string; code: string };
  faculty: string | { _id: string; name: string };
  room: string | { _id: string; name: string; building: string };
  batch: string;
  type: 'theory' | 'practical';
}

interface Timetable {
  _id: string;
  name: string;
  department: { name: string; code: string };
  batch?: { _id: string; name: string; year: number; semester: number; division: string; studentCount: number };
  batches?: Array<{ _id: string; name: string }>;
  academicYear: string;
  semester: number;
  status: string;
  entries: TimetableEntry[];
  hardConstraintViolations: number;
  softConstraintViolations: number;
  optimizationScore?: number;
  rejectionReason?: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Props {
  params: Promise<{ id: string }>;
}

export default function TimetableDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addModal, setAddModal] = useState<{ open: boolean; day: number; slot: number } | null>(null);
  const [submitModal, setSubmitModal] = useState(false);
  const [generateModal, setGenerateModal] = useState(false);
  const [conflictsModal, setConflictsModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [validating, setValidating] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);
  const [generationStats, setGenerationStats] = useState<GenerationStats | null>(null);
  const [generationOptions, setGenerationOptions] = useState<GenerationOptions>({
    maxGapsPerDay: 2,
    preferConsecutiveLectures: true,
    balanceFacultyLoad: true,
    prioritizePreferredSlots: true,
  });
  const [error, setError] = useState('');

  const [entryForm, setEntryForm] = useState({
    subject: '',
    faculty: '',
    room: '',
    type: 'theory' as 'theory' | 'practical',
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [timetableRes, subjectsRes, facultyRes, roomsRes, timeSlotsRes] = await Promise.all([
        fetch(`/api/coordinator/timetables/${id}`),
        fetch('/api/coordinator/subjects'),
        fetch('/api/coordinator/faculty'),
        fetch('/api/coordinator/rooms'),
        fetch('/api/coordinator/timeslots'),
      ]);

      if (timetableRes.ok) {
        const data = await timetableRes.json();
        setTimetable(data);
      }

      if (subjectsRes.ok) {
        const data = await subjectsRes.json();
        setSubjects(data.subjects);
      }

      if (facultyRes.ok) {
        const data = await facultyRes.json();
        setFaculty(data.faculty);
      }

      if (roomsRes.ok) {
        const data = await roomsRes.json();
        setRooms(data.rooms);
      }

      if (timeSlotsRes.ok) {
        const data = await timeSlotsRes.json();
        setTimeSlots(data.timeSlots.filter((s: TimeSlot) => s.type !== 'break' && s.type !== 'lunch'));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEntry = (day: number, slot: number) => {
    return timetable?.entries.find((e) => e.day === day && e.slot === slot);
  };

  const handleAddEntry = async () => {
    if (!addModal || !timetable) return;

    setSaving(true);
    setError('');

    try {
      const newEntry: TimetableEntry = {
        day: addModal.day,
        slot: addModal.slot,
        subject: entryForm.subject,
        faculty: entryForm.faculty,
        room: entryForm.room,
        batch: timetable.batch?._id || '',
        type: entryForm.type,
      };

      const updatedEntries = [...timetable.entries, newEntry];

      const response = await fetch(`/api/coordinator/timetables/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: updatedEntries }),
      });

      if (response.ok) {
        const updated = await response.json();
        setTimetable({ ...timetable, entries: updated.entries });
        setAddModal(null);
        setEntryForm({ subject: '', faculty: '', room: '', type: 'theory' });
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add entry');
      }
    } catch {
      setError('Failed to add entry');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveEntry = async (day: number, slot: number) => {
    if (!timetable) return;

    const updatedEntries = timetable.entries.filter(
      (e) => !(e.day === day && e.slot === slot)
    );

    try {
      const response = await fetch(`/api/coordinator/timetables/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: updatedEntries }),
      });

      if (response.ok) {
        const updated = await response.json();
        setTimetable({ ...timetable, entries: updated.entries });
      }
    } catch (error) {
      console.error('Error removing entry:', error);
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/coordinator/timetables/${id}/submit`, {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/coordinator/timetables');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit timetable');
      }
    } catch (error) {
      console.error('Error submitting timetable:', error);
      alert('Failed to submit timetable');
    } finally {
      setSaving(false);
      setSubmitModal(false);
    }
  };

  const handleAutoGenerate = async () => {
    if (!timetable) return;

    setGenerating(true);
    setError('');
    setConflicts([]);
    setGenerationStats(null);

    try {
      const response = await fetch(`/api/coordinator/timetables/${id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generationOptions),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh timetable data
        const timetableRes = await fetch(`/api/coordinator/timetables/${id}`);
        if (timetableRes.ok) {
          const updatedTimetable = await timetableRes.json();
          setTimetable(updatedTimetable);
        }

        setGenerationStats(data.stats);
        setConflicts(data.conflicts || []);
        setGenerateModal(false);

        if (data.conflicts && data.conflicts.length > 0) {
          setConflictsModal(true);
        }
      } else {
        setError(data.error || 'Failed to generate timetable');
      }
    } catch {
      setError('Failed to generate timetable');
    } finally {
      setGenerating(false);
    }
  };

  const handleValidate = async () => {
    if (!timetable) return;

    setValidating(true);

    try {
      const response = await fetch(`/api/coordinator/timetables/${id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxGapsPerDay: generationOptions.maxGapsPerDay,
          maxHoursPerDay: 6,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const allConflicts = [...(data.hardConflicts || []), ...(data.softConflicts || [])];
        setConflicts(allConflicts);

        // Refresh timetable to get updated scores
        const timetableRes = await fetch(`/api/coordinator/timetables/${id}`);
        if (timetableRes.ok) {
          const updatedTimetable = await timetableRes.json();
          setTimetable(updatedTimetable);
        }

        if (allConflicts.length > 0) {
          setConflictsModal(true);
        } else {
          alert('No conflicts found! Timetable is valid.');
        }
      }
    } catch {
      alert('Failed to validate timetable');
    } finally {
      setValidating(false);
    }
  };

  const getSubjectById = (subjectId: string) => {
    return subjects.find((s) => s._id === subjectId);
  };

  const handleSubjectChange = (subjectId: string) => {
    const subject = getSubjectById(subjectId);
    setEntryForm({
      ...entryForm,
      subject: subjectId,
      faculty: subject?.assignedFaculty?._id || '',
      type: subject?.type === 'lab' ? 'practical' : 'theory',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      published: 'success',
      approved: 'success',
      pending: 'warning',
      draft: 'info',
      rejected: 'danger',
    };
    return <Badge variant={variants[status] || 'info'}>{status}</Badge>;
  };

  if (loading) {
    return <Loading text="Loading timetable..." />;
  }

  if (!timetable) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-muted)]">Timetable not found</p>
        <Link href="/coordinator/timetables">
          <Button className="mt-4">Back to Timetables</Button>
        </Link>
      </div>
    );
  }

  const canEdit = timetable.status === 'draft' || timetable.status === 'rejected';

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <Link
            href="/coordinator/timetables"
            className="text-primary hover:text-indigo-700 text-sm mb-2 inline-block"
          >
            ← Back to Timetables
          </Link>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {timetable.name}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {timetable.batch?.name} | {timetable.academicYear} - Semester {timetable.semester}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {getStatusBadge(timetable.status)}
          {canEdit && (
            <>
              <Button variant="secondary" onClick={() => setGenerateModal(true)}>
                Auto Generate
              </Button>
              <Button variant="secondary" onClick={handleValidate} disabled={validating}>
                {validating ? 'Validating...' : ' Validate'}
              </Button>
            </>
          )}
          {canEdit && timetable.entries.length > 0 && (
            <Button onClick={() => setSubmitModal(true)}>
              Submit for Approval
            </Button>
          )}
        </div>
      </div>

      {/* Rejection Reason */}
      {timetable.status === 'rejected' && timetable.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-1">
            Rejection Reason
          </h3>
          <p className="text-red-700">{timetable.rejectionReason}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-[var(--surface)] rounded-xl shadow p-4">
          <p className="text-sm text-[var(--text-muted)]">Total Classes</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {timetable.entries.length}
          </p>
        </div>
        <div className="bg-[var(--surface)] rounded-xl shadow p-4">
          <p className="text-sm text-[var(--text-muted)]">Students</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {timetable.batch?.studentCount || 0}
          </p>
        </div>
        <div className="bg-[var(--surface)] rounded-xl shadow p-4">
          <p className="text-sm text-[var(--text-muted)]">Optimization Score</p>
          <p className={`text-2xl font-bold ${
            (timetable.optimizationScore ?? 0) >= 8 ? 'text-green-600' : 
            (timetable.optimizationScore ?? 0) >= 5 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {timetable.optimizationScore?.toFixed(1) ?? 'N/A'}/10
          </p>
        </div>
        <div className="bg-[var(--surface)] rounded-xl shadow p-4">
          <p className="text-sm text-[var(--text-muted)]">Hard Conflicts</p>
          <p className={`text-2xl font-bold ${timetable.hardConstraintViolations > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {timetable.hardConstraintViolations}
          </p>
        </div>
        <div className="bg-[var(--surface)] rounded-xl shadow p-4">
          <p className="text-sm text-[var(--text-muted)]">Soft Conflicts</p>
          <p className={`text-2xl font-bold ${timetable.softConstraintViolations > 0 ? 'text-amber-600' : 'text-green-600'}`}>
            {timetable.softConstraintViolations}
          </p>
        </div>
      </div>

      {/* Generation Stats */}
      {generationStats && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-indigo-800 mb-2">
            Last Generation Results
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-primary">Classes Placed:</span>{' '}
              <span className="font-medium">{generationStats.placedClasses}/{generationStats.totalClasses}</span>
            </div>
            <div>
              <span className="text-primary">Unplaced:</span>{' '}
              <span className="font-medium">{generationStats.unplacedClasses}</span>
            </div>
            <div>
              <span className="text-primary">Iterations:</span>{' '}
              <span className="font-medium">{generationStats.iterations}</span>
            </div>
            <div>
              <span className="text-primary">Time:</span>{' '}
              <span className="font-medium">{generationStats.timeTaken}ms</span>
            </div>
          </div>
        </div>
      )}

      {/* Conflicts Warning */}
      {conflicts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-amber-800">
                {conflicts.filter(c => c.severity === 'hard').length} Hard Conflicts, {conflicts.filter(c => c.severity === 'soft').length} Soft Conflicts
              </h3>
              <p className="text-sm text-amber-600">
                Review and resolve conflicts before submitting for approval.
              </p>
            </div>
            <Button variant="secondary" onClick={() => setConflictsModal(true)}>
              View Details
            </Button>
          </div>
        </div>
      )}

      {/* Timetable Grid */}
      <div className="bg-[var(--surface)] rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-500">
                  Time Slot
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="border border-gray-200 p-3 text-center text-sm font-medium text-gray-500"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot._id}>
                  <td className="border border-gray-200 p-3 bg-gray-50">
                    <div className="text-sm font-medium text-[var(--text-primary)]">
                      {slot.name}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </td>
                  {DAYS.map((_, dayIndex) => {
                    const entry = getEntry(dayIndex, slot.slotNumber);
                    return (
                      <td
                        key={dayIndex}
                        className="border border-gray-200 p-2 min-w-[140px]"
                      >
                        {entry ? (
                          <div className={`p-2 rounded-lg text-xs ${
                            entry.type === 'practical'
                              ? 'bg-green-100'
                              : 'bg-blue-100'
                          }`}>
                            <div className="font-semibold text-[var(--text-primary)]">
                              {typeof entry.subject === 'object' ? entry.subject.code : subjects.find(s => s._id === entry.subject)?.code || 'N/A'}
                            </div>
                            <div className="text-[var(--text-secondary)]">
                              {typeof entry.faculty === 'object' ? entry.faculty.name : faculty.find(f => f._id === entry.faculty)?.name || 'N/A'}
                            </div>
                            <div className="text-gray-500">
                              {typeof entry.room === 'object' ? entry.room.name : rooms.find(r => r._id === entry.room)?.name || 'N/A'}
                            </div>
                            {canEdit && (
                              <button
                                onClick={() => handleRemoveEntry(dayIndex, slot.slotNumber)}
                                className="mt-1 text-red-600 hover:text-red-700 text-xs"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ) : canEdit ? (
                          <button
                            onClick={() => setAddModal({ open: true, day: dayIndex, slot: slot.slotNumber })}
                            className="w-full h-full min-h-[60px] border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors flex items-center justify-center text-gray-400 hover:text-[var(--purple)]"
                          >
                            + Add
                          </button>
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

      {timeSlots.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6">
          <p className="text-amber-700">
            No time slots configured.{' '}
            <Link href="/coordinator/timeslots" className="underline">
              Configure time slots first
            </Link>
          </p>
        </div>
      )}

      {/* Add Entry Modal */}
      <Modal
        isOpen={addModal?.open || false}
        onClose={() => {
          setAddModal(null);
          setEntryForm({ subject: '', faculty: '', room: '', type: 'theory' });
          setError('');
        }}
        title={`Add Class - ${addModal ? DAYS[addModal.day] : ''}`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddEntry();
          }}
        >
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Subject *
              </label>
              <Select
                value={entryForm.subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                required
              >
                <option value="">Select subject...</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.code} - {subject.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Faculty *
              </label>
              <Select
                value={entryForm.faculty}
                onChange={(e) => setEntryForm({ ...entryForm, faculty: e.target.value })}
                required
              >
                <option value="">Select faculty...</option>
                {faculty.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Room *
              </label>
              <Select
                value={entryForm.room}
                onChange={(e) => setEntryForm({ ...entryForm, room: e.target.value })}
                required
              >
                <option value="">Select room...</option>
                {rooms.map((room) => (
                  <option key={room._id} value={room._id}>
                    {room.name} ({room.building}, Cap: {room.capacity})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Class Type
              </label>
              <Select
                value={entryForm.type}
                onChange={(e) => setEntryForm({ ...entryForm, type: e.target.value as 'theory' | 'practical' })}
              >
                <option value="theory">Theory</option>
                <option value="practical">Practical</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-[var(--border-light)]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setAddModal(null);
                setEntryForm({ subject: '', faculty: '', room: '', type: 'theory' });
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Adding...' : 'Add Class'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submit Modal */}
      <Modal
        isOpen={submitModal}
        onClose={() => setSubmitModal(false)}
        title="Submit for Approval"
      >
        <p className="text-[var(--text-secondary)] mb-6">
          Are you sure you want to submit this timetable for HOD approval?
          You won&apos;t be able to edit it until it&apos;s approved or rejected.
        </p>
        <div className="flex justify-end gap-4">
          <Button variant="secondary" onClick={() => setSubmitModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmitForApproval} disabled={saving}>
            {saving ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </Modal>

      {/* Auto Generate Modal */}
      <Modal
        isOpen={generateModal}
        onClose={() => setGenerateModal(false)}
        title="Auto Generate Timetable"
      >
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">
            Configure generation preferences and let the algorithm create an optimized timetable.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h4 className="font-medium text-[var(--text-primary)]">Generation Options</h4>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Max Gaps Per Day
              </label>
              <Select
                value={generationOptions.maxGapsPerDay.toString()}
                onChange={(e) => setGenerationOptions({
                  ...generationOptions,
                  maxGapsPerDay: parseInt(e.target.value),
                })}
              >
                <option value="0">0 (No gaps)</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={generationOptions.preferConsecutiveLectures}
                  onChange={(e) => setGenerationOptions({
                    ...generationOptions,
                    preferConsecutiveLectures: e.target.checked,
                  })}
                  className="rounded border-input text-primary focus:ring-ring"
                />
                <span className="text-sm text-foreground">
                  Prefer consecutive lectures
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={generationOptions.balanceFacultyLoad}
                  onChange={(e) => setGenerationOptions({
                    ...generationOptions,
                    balanceFacultyLoad: e.target.checked,
                  })}
                  className="rounded border-input text-primary focus:ring-ring"
                />
                <span className="text-sm text-foreground">
                  Balance faculty workload
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={generationOptions.prioritizePreferredSlots}
                  onChange={(e) => setGenerationOptions({
                    ...generationOptions,
                    prioritizePreferredSlots: e.target.checked,
                  })}
                  className="rounded border-input text-primary focus:ring-ring"
                />
                <span className="text-sm text-foreground">
                  Prioritize faculty preferred slots
                </span>
              </label>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-700">
              This will replace any existing entries in the timetable.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-[var(--border-light)]">
          <Button variant="secondary" onClick={() => setGenerateModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleAutoGenerate} disabled={generating}>
            {generating ? 'Generating...' : 'Generate Timetable'}
          </Button>
        </div>
      </Modal>

      {/* Conflicts Modal */}
      <Modal
        isOpen={conflictsModal}
        onClose={() => setConflictsModal(false)}
        title="Conflicts & Warnings"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {conflicts.filter(c => c.severity === 'hard').length > 0 && (
            <div>
              <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                Hard Conflicts ({conflicts.filter(c => c.severity === 'hard').length})
              </h4>
              <div className="space-y-2">
                {conflicts
                  .filter(c => c.severity === 'hard')
                  .map((conflict, index) => (
                    <div
                      key={index}
                      className="bg-red-50 border border-red-200 rounded-lg p-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-red-500">✕</span>
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            {conflict.type.replace('_', ' ').toUpperCase()}
                          </p>
                          <p className="text-sm text-red-600">
                            {conflict.message}
                          </p>
                          {conflict.day !== undefined && (
                            <p className="text-xs text-red-500 mt-1">
                              {DAYS[conflict.day]} - Slot {conflict.slot}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {conflicts.filter(c => c.severity === 'soft').length > 0 && (
            <div>
              <h4 className="font-semibold text-amber-700 mb-2 flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                Soft Conflicts / Warnings ({conflicts.filter(c => c.severity === 'soft').length})
              </h4>
              <div className="space-y-2">
                {conflicts
                  .filter(c => c.severity === 'soft')
                  .map((conflict, index) => (
                    <div
                      key={index}
                      className="bg-amber-50 border border-amber-200 rounded-lg p-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-amber-500">!</span>
                        <div>
                          <p className="text-sm font-medium text-amber-800">
                            {conflict.type.replace('_', ' ').toUpperCase()}
                          </p>
                          <p className="text-sm text-amber-600">
                            {conflict.message}
                          </p>
                          {conflict.day !== undefined && (
                            <p className="text-xs text-amber-500 mt-1">
                              {DAYS[conflict.day]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {conflicts.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2"></div>
              <p className="text-green-600 font-medium">
                No conflicts found!
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-[var(--border-light)]">
          <Button onClick={() => setConflictsModal(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}
