// ===========================================
// Coordinator Batches API
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Batch from '@/models/Batch';

// GET - List all batches for department
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'coordinator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const semester = searchParams.get('semester');
    const search = searchParams.get('search');
    const active = searchParams.get('active');

    const departmentId = session.user.department;

    if (!departmentId) {
      return NextResponse.json(
        { error: 'No department assigned to your account. Please contact admin.', batches: [] },
        { status: 200 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { department: departmentId };

    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);
    if (active !== null && active !== undefined) query.isActive = active === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { division: { $regex: search, $options: 'i' } },
      ];
    }

    const batches = await Batch.find(query)
      .populate('department', 'name code')
      .sort({ year: 1, semester: 1, division: 1 });

    return NextResponse.json({ batches });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}

// POST - Create new batch
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'coordinator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const body = await request.json();
    const { name, year, semester, division, studentCount, academicYear } = body;

    // Validate required fields
    if (!name || !year || !semester || !division || !studentCount || !academicYear) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const departmentId = session.user.department;

    if (!departmentId) {
      return NextResponse.json(
        { error: 'No department assigned to your account. Please contact admin.' },
        { status: 400 }
      );
    }

    // Check if batch already exists
    const existingBatch = await Batch.findOne({
      department: departmentId,
      year,
      semester,
      division,
      academicYear,
    });

    if (existingBatch) {
      return NextResponse.json(
        { error: 'Batch already exists for this year/semester/division' },
        { status: 400 }
      );
    }

    const batch = await Batch.create({
      name,
      department: departmentId,
      year,
      semester,
      division,
      studentCount,
      academicYear,
      isActive: true,
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json(
      { error: 'Failed to create batch' },
      { status: 500 }
    );
  }
}
