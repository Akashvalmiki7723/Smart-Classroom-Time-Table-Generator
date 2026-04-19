// ===========================================
// Room Utilization Report API
// ===========================================

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';
import Timetable from '@/models/Timetable';
import TimeSlot from '@/models/TimeSlot';

export async function GET() {
  try {
    await dbConnect();

    const rooms = await Room.find({ isActive: true }).lean();
    const timeSlots = await TimeSlot.find({ isActive: true, type: { $in: ['theory', 'practical'] } }).lean();
    const timetables = await Timetable.find({ status: { $in: ['approved', 'published'] } }).lean();

    // Total available slots per room = 6 days * number of teaching time slots
    const slotsPerDay = timeSlots.length || 7;
    const totalSlotsPerRoom = 6 * slotsPerDay;

    // Count used slots per room
    const roomUsage: Record<string, { usedSlots: number; byDay: number[]; byType: Record<string, number> }> = {};

    for (const room of rooms) {
      roomUsage[room._id.toString()] = {
        usedSlots: 0,
        byDay: [0, 0, 0, 0, 0, 0],
        byType: {},
      };
    }

    for (const tt of timetables) {
      for (const entry of tt.entries || []) {
        const roomId = entry.room?.toString();
        if (roomId && roomUsage[roomId]) {
          roomUsage[roomId].usedSlots++;
          if (entry.day >= 0 && entry.day < 6) {
            roomUsage[roomId].byDay[entry.day]++;
          }
          const entryType = entry.type || 'theory';
          roomUsage[roomId].byType[entryType] = (roomUsage[roomId].byType[entryType] || 0) + 1;
        }
      }
    }

    // Build room reports
    const roomReports = rooms.map((room) => {
      const usage = roomUsage[room._id.toString()];
      const utilizationPercent = totalSlotsPerRoom > 0
        ? Math.round((usage.usedSlots / totalSlotsPerRoom) * 100)
        : 0;

      return {
        room: {
          _id: room._id.toString(),
          name: room.name,
          building: room.building,
          floor: room.floor,
          type: room.type,
          capacity: room.capacity,
        },
        usedSlots: usage.usedSlots,
        utilizationPercent,
        byDay: usage.byDay,
        byType: usage.byType,
      };
    });

    // By building aggregation
    const byBuilding: Record<string, { rooms: number; totalUtilization: number; avgUtilization: number }> = {};
    for (const report of roomReports) {
      const building = report.room.building;
      if (!byBuilding[building]) {
        byBuilding[building] = { rooms: 0, totalUtilization: 0, avgUtilization: 0 };
      }
      byBuilding[building].rooms++;
      byBuilding[building].totalUtilization += report.utilizationPercent;
    }
    for (const key of Object.keys(byBuilding)) {
      byBuilding[key].avgUtilization = Math.round(
        byBuilding[key].totalUtilization / byBuilding[key].rooms
      );
    }

    // Summary
    const totalUsedSlots = roomReports.reduce((sum, r) => sum + r.usedSlots, 0);
    const totalAvailableSlots = rooms.length * totalSlotsPerRoom;
    const overallUtilization = totalAvailableSlots > 0
      ? Math.round((totalUsedSlots / totalAvailableSlots) * 100)
      : 0;

    return NextResponse.json({
      summary: {
        totalRooms: rooms.length,
        totalUsedSlots,
        totalAvailableSlots,
        overallUtilization,
      },
      byBuilding,
      rooms: roomReports,
    });
  } catch (error) {
    console.error('Room utilization report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate room utilization report' },
      { status: 500 }
    );
  }
}
