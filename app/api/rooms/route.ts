// ===========================================
// Rooms API Route
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';

// GET - Fetch all rooms
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const type = searchParams.get('type');
    const building = searchParams.get('building');

    const filter: any = { $or: [{ isAvailable: true }, { isActive: true }] };
    if (department) filter.department = department;
    if (type) filter.type = type;
    if (building) filter.building = building;

    const rooms = await Room.find(filter)
      .populate('department', 'name code')
      .sort({ building: 1, name: 1 });

    return NextResponse.json({ success: true, rooms });
  } catch (error) {
    console.error('Rooms fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

// POST - Create new room
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const room = await Room.create(body);

    return NextResponse.json({ success: true, room }, { status: 201 });
  } catch (error: any) {
    console.error('Room create error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create room' },
      { status: 500 }
    );
  }
}
