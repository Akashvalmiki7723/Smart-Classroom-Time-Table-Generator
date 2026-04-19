// ===========================================
// Faculty Workload Report API
// ===========================================

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Timetable from '@/models/Timetable';
import Subject from '@/models/Subject';
import Batch from '@/models/Batch';

export async function GET() {
  try {
    await dbConnect();

    const facultyUsers = await User.find({ role: 'faculty', isActive: true }).lean();
    const timetables = await Timetable.find({ status: { $in: ['approved', 'published'] } }).lean();
    const subjects = await Subject.find({}).lean();
    const batches = await Batch.find({}).lean();

    // Build lookup maps
    const subjectMap: Record<string, string> = {};
    for (const s of subjects) {
      subjectMap[s._id.toString()] = s.name;
    }
    const batchMap: Record<string, string> = {};
    for (const b of batches) {
      batchMap[b._id.toString()] = b.name;
    }

    // Count classes per faculty
    const facultyWorkload: Record<string, {
      totalClasses: number;
      byDay: number[];
      byType: Record<string, number>;
      subjects: Set<string>;
      batches: Set<string>;
    }> = {};

    for (const faculty of facultyUsers) {
      facultyWorkload[faculty._id.toString()] = {
        totalClasses: 0,
        byDay: [0, 0, 0, 0, 0, 0],
        byType: {},
        subjects: new Set(),
        batches: new Set(),
      };
    }

    for (const tt of timetables) {
      for (const entry of tt.entries || []) {
        const facultyId = entry.faculty?.toString();
        if (facultyId && facultyWorkload[facultyId]) {
          facultyWorkload[facultyId].totalClasses++;
          if (entry.day >= 0 && entry.day < 6) {
            facultyWorkload[facultyId].byDay[entry.day]++;
          }
          const entryType = entry.type || 'theory';
          facultyWorkload[facultyId].byType[entryType] =
            (facultyWorkload[facultyId].byType[entryType] || 0) + 1;

          if (entry.subject) {
            const subName = subjectMap[entry.subject.toString()];
            if (subName) facultyWorkload[facultyId].subjects.add(subName);
          }
          if (entry.batch) {
            const batchName = batchMap[entry.batch.toString()];
            if (batchName) facultyWorkload[facultyId].batches.add(batchName);
          }
        }
      }
    }

    // Build faculty reports
    const totalClasses = Object.values(facultyWorkload).reduce((sum, w) => sum + w.totalClasses, 0);
    const avgClassesPerFaculty = facultyUsers.length > 0
      ? Math.round(totalClasses / facultyUsers.length)
      : 0;

    const facultyReports = facultyUsers.map((faculty) => {
      const workload = facultyWorkload[faculty._id.toString()];
      const daysWithClasses = workload.byDay.filter(d => d > 0).length;

      return {
        faculty: {
          _id: faculty._id.toString(),
          name: faculty.name,
          email: faculty.email,
        },
        totalClasses: workload.totalClasses,
        totalHours: workload.totalClasses, // Approximate: 1 class = 1 hour
        avgClassesPerDay: daysWithClasses > 0
          ? Math.round((workload.totalClasses / daysWithClasses) * 10) / 10
          : 0,
        byDay: workload.byDay,
        byType: workload.byType,
        subjectCount: workload.subjects.size,
        batchCount: workload.batches.size,
        subjects: Array.from(workload.subjects),
        batches: Array.from(workload.batches),
      };
    });

    // Distribution
    let underloaded = 0, optimal = 0, overloaded = 0;
    for (const report of facultyReports) {
      if (avgClassesPerFaculty === 0) {
        optimal++;
      } else if (report.totalClasses < avgClassesPerFaculty * 0.7) {
        underloaded++;
      } else if (report.totalClasses > avgClassesPerFaculty * 1.3) {
        overloaded++;
      } else {
        optimal++;
      }
    }

    return NextResponse.json({
      summary: {
        totalFaculty: facultyUsers.length,
        totalClasses,
        avgClassesPerFaculty,
        distribution: { underloaded, optimal, overloaded },
      },
      faculty: facultyReports,
    });
  } catch (error) {
    console.error('Faculty workload report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate faculty workload report' },
      { status: 500 }
    );
  }
}
