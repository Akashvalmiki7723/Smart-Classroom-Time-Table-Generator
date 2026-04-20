// ===========================================
// Timetables API Route
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Timetable from '@/models/Timetable';
import User from '@/models/User';

// GET - Fetch timetables based on role
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const batch = searchParams.get('batch');
    const status = searchParams.get('status');

    let filter: any = {};

    // Admin and coordinator can see all
    if (['admin', 'coordinator'].includes(session.user.role)) {
      if (department) filter.department = department;
      if (batch) filter.batch = batch;
      if (status) filter.status = status;
    }
    // HOD can see their department timetables
    else if (session.user.role === 'hod') {
      const user = await User.findById(session.user.id);
      if (user?.department) {
        filter.department = user.department;
      }
      if (status) filter.status = status;
    }
    // Faculty can see timetables where they have entries
    else if (session.user.role === 'faculty') {
      filter['entries.faculty'] = session.user.id;
    }
    // Students can see their batch timetable
    else if (session.user.role === 'student') {
      const user = await User.findById(session.user.id);
      if (user?.department) {
        filter.department = user.department;
        // Show published and approved timetables to students
        filter.status = { $in: ['published', 'approved'] };
      }
    }

    const timetables = await Timetable.find(filter)
      .populate('department', 'name code')
      .populate('batch', 'name year division semester studentCount')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .populate({
        path: 'entries.subject',
        select: 'name code credits type',
      })
      .populate({
        path: 'entries.faculty',
        select: 'name email',
      })
      .populate({
        path: 'entries.room',
        select: 'name building floor type',
      })
      .populate({
        path: 'entries.batch',
        select: 'name year division semester',
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, timetables });
  } catch (error) {
    console.error('Timetables fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch timetables' },
      { status: 500 }
    );
  }
}

// POST - Create new timetable
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    body.createdBy = session.user.id;
    body.status = 'draft';

    const timetable = await Timetable.create(body);

    return NextResponse.json({ success: true, timetable }, { status: 201 });
  } catch (error: any) {
    console.error('Timetable create error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create timetable' },
      { status: 500 }
    );
  }
}
