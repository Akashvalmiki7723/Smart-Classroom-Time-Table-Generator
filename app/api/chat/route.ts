// ===========================================
// AI Chatbot API Route — Data-Aware OpenRouter Integration
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Department from '@/models/Department';
import Subject from '@/models/Subject';
import Room from '@/models/Room';
import Batch from '@/models/Batch';
import Timetable from '@/models/Timetable';
import TimeSlot from '@/models/TimeSlot';

const API_KEYS = [
  process.env.OPENROUTER_API_KEY_1,
  process.env.OPENROUTER_API_KEY_2,
  process.env.OPENROUTER_API_KEY_3,
];

const MODELS = [
  'google/gemma-4-31b-it:free',
  'google/gemma-3-12b-it:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'qwen/qwen3-coder:free',
  'openai/gpt-oss-20b:free',
  'google/gemma-3-4b-it:free',
];

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ─── Fetch real data based on role ────────────────────────────────────────────
async function getContextData(userRole: string, userId?: string, departmentId?: string) {
  try {
    await dbConnect();

    if (userRole === 'admin') {
      const [userCount, deptCount, subjectCount, roomCount, batchCount, timetableCount, activeTimeSlots] = await Promise.all([
        User.countDocuments({ isActive: true }),
        Department.countDocuments({ isActive: true }),
        Subject.countDocuments({ isActive: true }),
        Room.countDocuments({ isActive: true }),
        Batch.countDocuments({ isActive: true }),
        Timetable.countDocuments(),
        TimeSlot.find({ isActive: true }).sort({ slotNumber: 1 }).lean(),
      ]);

      const roleCounts = await User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]);

      const timetablesByStatus = await Timetable.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      const rooms = await Room.find({ isActive: true }).select('name building type capacity').lean();
      const departments = await Department.find({ isActive: true }).select('name code').lean();

      const roomsByType = await Room.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$type', count: { $sum: 1 }, avgCapacity: { $avg: '$capacity' } } },
      ]);

      return `
## LIVE SYSTEM DATA (Real-time from database):

### System Overview:
- Total active users: ${userCount}
${roleCounts.map((r: { _id: string; count: number }) => `  - ${r._id}: ${r.count}`).join('\n')}
- Total departments: ${deptCount}
- Total subjects: ${subjectCount}
- Total rooms: ${roomCount}
- Total batches: ${batchCount}
- Total timetables: ${timetableCount}

### Timetable Status Breakdown:
${timetablesByStatus.map((t: { _id: string; count: number }) => `- ${t._id}: ${t.count}`).join('\n') || '- No timetables created yet'}

### Rooms by Type:
${roomsByType.map((r: { _id: string; count: number; avgCapacity: number }) => `- ${r._id}: ${r.count} rooms (avg capacity: ${Math.round(r.avgCapacity)})`).join('\n')}

### Available Rooms:
${rooms.slice(0, 15).map((r: { name: string; building: string; type: string; capacity: number }) => `- ${r.name} (${r.building}, ${r.type}, capacity: ${r.capacity})`).join('\n')}
${rooms.length > 15 ? `... and ${rooms.length - 15} more rooms` : ''}

### Departments:
${departments.map((d: { name: string; code: string }) => `- ${d.name} (${d.code})`).join('\n')}

### Time Slots:
${activeTimeSlots.map((ts: { name: string; startTime: string; endTime: string; type: string }) => `- ${ts.name}: ${ts.startTime}–${ts.endTime} (${ts.type})`).join('\n') || '- No time slots configured'}`;
    }

    if (userRole === 'coordinator') {
      const query: Record<string, unknown> = {};
      if (departmentId) query.department = departmentId;

      const [timetables, rooms, batches, timeSlots] = await Promise.all([
        Timetable.find(query).populate('department', 'name').sort({ createdAt: -1 }).limit(10).lean(),
        Room.find({ isActive: true }).select('name building type capacity').lean(),
        Batch.find(departmentId ? { department: departmentId, isActive: true } : { isActive: true }).populate('department', 'name').lean(),
        TimeSlot.find({ isActive: true }).sort({ slotNumber: 1 }).lean(),
      ]);

      return `
## LIVE SYSTEM DATA:

### Your Timetables (most recent):
${timetables.length > 0
  ? timetables.map((tt: any) => {
      const dept = tt.department as { name?: string } | null;
      return `- "${tt.name}" — Status: ${tt.status}, Department: ${dept?.name || 'N/A'}, Entries: ${(tt.entries as unknown[])?.length || 0}`;
    }).join('\n')
  : '- No timetables created yet'}

### Available Rooms (${rooms.length} total):
${rooms.slice(0, 10).map((r: { name: string; building: string; type: string; capacity: number }) => `- ${r.name} (${r.building}, ${r.type}, capacity: ${r.capacity})`).join('\n')}

### Batches:
${batches.map((b: any) => {
  const dept = b.department as { name?: string } | null;
  return `- ${b.name} — Year ${b.year}, Sem ${b.semester}, Div ${b.division}, Students: ${b.studentCount}, Dept: ${dept?.name || 'N/A'}`;
}).join('\n') || '- No batches found'}

### Time Slots:
${timeSlots.map((ts: { name: string; startTime: string; endTime: string; type: string }) => `- ${ts.name}: ${ts.startTime}–${ts.endTime} (${ts.type})`).join('\n')}`;
    }

    if (userRole === 'faculty' && userId) {
      // Get faculty's timetable entries
      const timetables = await Timetable.find({
        status: { $in: ['approved', 'published'] },
        'entries.faculty': userId,
      })
        .populate('entries.subject', 'name code')
        .populate('entries.room', 'name building')
        .populate('entries.batch', 'name year division')
        .populate('department', 'name')
        .lean();

      // Extract this faculty's entries
      const myEntries: { day: string; slot: number; subject: string; room: string; batch: string; type: string }[] = [];
      for (const tt of timetables) {
        for (const entry of (tt.entries || []) as any[]) {
          const entryFaculty = entry.faculty as { toString?: () => string } | string;
          const facultyId = typeof entryFaculty === 'string' ? entryFaculty : entryFaculty?.toString?.();
          if (facultyId === userId) {
            const subject = entry.subject as { name?: string; code?: string } | null;
            const room = entry.room as { name?: string; building?: string } | null;
            const batch = entry.batch as { name?: string; year?: number; division?: string } | null;
            myEntries.push({
              day: DAY_NAMES[entry.day as number] || `Day ${entry.day}`,
              slot: (entry.slot as number) + 1,
              subject: subject ? `${subject.name} (${subject.code})` : 'Unknown',
              room: room ? `${room.name} (${room.building})` : 'Unknown',
              batch: batch ? `${batch.name}` : 'Unknown',
              type: entry.type as string || 'theory',
            });
          }
        }
      }

      // Get subjects assigned to this faculty
      const assignedSubjects = await Subject.find({ assignedFaculty: userId, isActive: true })
        .populate('department', 'name')
        .lean();

      // Group entries by day
      const scheduleByDay: Record<string, typeof myEntries> = {};
      for (const entry of myEntries) {
        if (!scheduleByDay[entry.day]) scheduleByDay[entry.day] = [];
        scheduleByDay[entry.day].push(entry);
      }

      const timeSlots = await TimeSlot.find({ isActive: true }).sort({ slotNumber: 1 }).lean();

      return `
## LIVE DATA — YOUR FACULTY PROFILE:

### Your Weekly Schedule (${myEntries.length} total classes):
${DAY_NAMES.map(day => {
  const dayEntries = scheduleByDay[day] || [];
  if (dayEntries.length === 0) return `**${day}**: No classes`;
  return `**${day}**: ${dayEntries.length} classes\n${dayEntries
    .sort((a, b) => a.slot - b.slot)
    .map(e => `  - Slot ${e.slot}: ${e.subject} | Room: ${e.room} | Batch: ${e.batch} | ${e.type}`)
    .join('\n')}`;
}).join('\n')}

### Your Assigned Subjects (${assignedSubjects.length}):
${assignedSubjects.map((s: any) => {
  const dept = s.department as { name?: string } | null;
  return `- ${s.name} (${s.code}) — ${s.type}, Sem ${s.semester}, ${s.credits} credits, Dept: ${dept?.name || 'N/A'}`;
}).join('\n') || '- No subjects directly assigned'}

### Time Slot Reference:
${timeSlots.map((ts: { name: string; startTime: string; endTime: string; slotNumber: number }) => `- Slot ${ts.slotNumber}: ${ts.startTime}–${ts.endTime}`).join('\n')}

### Summary:
- Total weekly classes: ${myEntries.length}
- Teaching days: ${Object.keys(scheduleByDay).filter(d => (scheduleByDay[d]?.length || 0) > 0).length}/6
- Unique subjects: ${new Set(myEntries.map(e => e.subject)).size}
- Unique batches: ${new Set(myEntries.map(e => e.batch)).size}`;
    }

    return '\n## No additional context data available for this role.';
  } catch (error) {
    console.error('Error fetching context data:', error);
    return '\n## Note: Could not fetch live data. Answering based on general knowledge.';
  }
}

// ─── System prompt builder ────────────────────────────────────────────────────
function getSystemPrompt(userRole: string, contextData: string, userName?: string) {
  const base = `You are the Smart Classroom AI Assistant for Presidency University's Timetable Management System. You are helpful, concise, and professional.
${userName ? `\nYou are talking to: ${userName}` : ''}
Current user role: ${userRole}

The system manages: departments, subjects, rooms, time slots, batches, faculty, timetables, reports, and user accounts.

Key facts:
- Timetables can have statuses: draft, pending, approved, published, rejected
- Rooms have types: lecture, lab, seminar, workshop
- Time slots cover Monday–Saturday (6 days)
- Users can be: admin, hod, coordinator, faculty, student
- The system uses AI-powered timetable generation with constraint optimization

## NAVIGATION CAPABILITY
You can navigate the user to pages. When the user asks to do something, include a navigation action:

[NAVIGATE:/path/to/page|Button Label Text]

RULES:
- Include [NAVIGATE:] at the END of your response when navigation is relevant
- Only suggest pages for the current user role
- Provide a brief explanation before the navigation action

## ANSWERING WITH REAL DATA
You have access to LIVE system data below. When the user asks about their schedule, timetable, rooms, users, etc., answer using THIS REAL DATA. Be specific with names, numbers, and details. Format schedules nicely.

${contextData}`;

  const roleNav: Record<string, string> = {
    admin: `
## ADMIN NAVIGATION ROUTES:
- /admin/dashboard — Dashboard
- /admin/users — Manage users | /admin/users/new — Create user
- /admin/departments — Departments
- /admin/subjects — Subjects
- /admin/rooms — Rooms
- /admin/time-slots — Time slots
- /admin/batches — Batches
- /admin/timetables — Timetables
- /admin/reports — Reports
- /admin/settings — Settings
- /admin/profile — Profile

INTENT MAPPING: "add user"→/admin/users/new, "manage users"→/admin/users, "reports"→/admin/reports, "timetables"→/admin/timetables, "rooms"→/admin/rooms, "departments"→/admin/departments, "subjects"→/admin/subjects, "batches"→/admin/batches, "time slots"→/admin/time-slots, "settings"→/admin/settings, "profile"→/admin/profile, "dashboard"→/admin/dashboard`,

    coordinator: `
## COORDINATOR NAVIGATION ROUTES:
- /coordinator/dashboard — Dashboard
- /coordinator/timetables — Timetables | /coordinator/timetables/new — Create timetable
- /coordinator/rooms — Rooms | /coordinator/rooms/new — Add room
- /coordinator/timeslots — Time slots
- /coordinator/batches — Batches | /coordinator/batches/new — Add batch
- /coordinator/reports — Reports
- /coordinator/settings — Settings
- /coordinator/profile — Profile

INTENT MAPPING: "create timetable"→/coordinator/timetables/new, "timetables"→/coordinator/timetables, "add room"→/coordinator/rooms/new, "rooms"→/coordinator/rooms, "batches"→/coordinator/batches, "reports"→/coordinator/reports, "dashboard"→/coordinator/dashboard`,

    faculty: `
## FACULTY NAVIGATION ROUTES:
- /faculty/dashboard — Dashboard
- /faculty/schedule — My schedule
- /faculty/subjects — My subjects
- /faculty/leaves — Leave management
- /faculty/settings — Settings
- /faculty/profile — Profile

INTENT MAPPING: "schedule"→/faculty/schedule, "subjects"→/faculty/subjects, "leave"→/faculty/leaves, "profile"→/faculty/profile, "dashboard"→/faculty/dashboard`,
  };

  return base + (roleNav[userRole] || roleNav.faculty);
}

// ─── POST handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { messages, userRole, userId, departmentId, userName } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // Fetch real data from DB
    const contextData = await getContextData(userRole || 'faculty', userId, departmentId);
    const systemPrompt = getSystemPrompt(userRole || 'faculty', contextData, userName);

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10),
    ];

    let lastError = '';
    for (const model of MODELS) {
      for (const apiKey of API_KEYS) {
        if (!apiKey) continue;

        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'Smart Classroom Timetable System',
            },
            body: JSON.stringify({
              model,
              messages: chatMessages,
              max_tokens: 1500,
              temperature: 0.7,
            }),
          });

          if (!response.ok) {
            lastError = `${model}: ${response.status}`;
            console.log(`Chat API: ${model} failed (${response.status}), trying next...`);
            if (response.status === 429 || response.status === 404 || response.status === 503) {
              break;
            }
            continue;
          }

          const data = await response.json();
          const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

          return NextResponse.json({ reply, model });
        } catch (err) {
          lastError = err instanceof Error ? err.message : 'Unknown error';
          continue;
        }
      }
    }

    return NextResponse.json(
      { error: 'All AI models are currently busy. Please try again in a moment.' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
