'use client';

import React, { useEffect, useState } from 'react';

// Icons
const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const RoomIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

interface RoomReport {
  room: {
    _id: string;
    name: string;
    building: string;
    floor: string;
    type: string;
    capacity: number;
  };
  usedSlots: number;
  utilizationPercent: number;
  byDay: number[];
  byType: Record<string, number>;
}

interface FacultyReport {
  faculty: {
    _id: string;
    name: string;
    email: string;
  };
  totalClasses: number;
  totalHours: number;
  avgClassesPerDay: number;
  byDay: number[];
  byType: Record<string, number>;
  subjectCount: number;
  batchCount: number;
  subjects: string[];
  batches: string[];
}

interface RoomData {
  summary: {
    totalRooms: number;
    totalUsedSlots: number;
    totalAvailableSlots: number;
    overallUtilization: number;
  };
  byBuilding: Record<string, { rooms: number; avgUtilization: number }>;
  rooms: RoomReport[];
}

interface FacultyData {
  summary: {
    totalFaculty: number;
    totalClasses: number;
    avgClassesPerFaculty: number;
    distribution: {
      underloaded: number;
      optimal: number;
      overloaded: number;
    };
  };
  faculty: FacultyReport[];
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'rooms' | 'faculty'>('rooms');
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [facultyData, setFacultyData] = useState<FacultyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'rooms') {
      fetchRoomReport();
    } else {
      fetchFacultyReport();
    }
  }, [activeTab]);

  const fetchRoomReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports/room-utilization');
      if (res.ok) {
        const data = await res.json();
        setRoomData(data);
      }
    } catch (error) {
      console.error('Error fetching room report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacultyReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports/faculty-workload');
      if (res.ok) {
        const data = await res.json();
        setFacultyData(data);
      }
    } catch (error) {
      console.error('Error fetching faculty report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUtilizationColor = (percent: number) => {
    if (percent < 30) return 'bg-red-500';
    if (percent < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getWorkloadStatus = (classes: number, avg: number) => {
    if (classes < avg * 0.7) return { label: 'Underloaded', color: 'text-yellow-600 bg-yellow-100' };
    if (classes > avg * 1.3) return { label: 'Overloaded', color: 'text-red-600 bg-red-100' };
    return { label: 'Optimal', color: 'text-green-600 bg-green-100' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">View utilization and workload reports</p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
              activeTab === 'rooms'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <RoomIcon />
            Room Utilization
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
              activeTab === 'faculty'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <UsersIcon />
            Faculty Workload
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : activeTab === 'rooms' && roomData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <RoomIcon />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Rooms</p>
                  <p className="text-2xl font-bold text-gray-900">{roomData.summary.totalRooms}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <ChartIcon />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Overall Utilization</p>
                  <p className="text-2xl font-bold text-gray-900">{roomData.summary.overallUtilization}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ChartIcon />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Used Slots</p>
                  <p className="text-2xl font-bold text-gray-900">{roomData.summary.totalUsedSlots}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <ChartIcon />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available Slots</p>
                  <p className="text-2xl font-bold text-gray-900">{roomData.summary.totalAvailableSlots}</p>
                </div>
              </div>
            </div>
          </div>

          {/* By Building */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilization by Building</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(roomData.byBuilding).map(([building, data]) => (
                <div key={building} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{building}</h4>
                  <p className="text-sm text-gray-500">{data.rooms} rooms</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Avg Utilization</span>
                      <span className="font-medium">{data.avgUtilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getUtilizationColor(data.avgUtilization)}`}
                        style={{ width: `${data.avgUtilization}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Room List */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Room Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Room</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Building</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Type</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-foreground">Capacity</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-foreground">Used Slots</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {roomData.rooms.map((report) => (
                    <tr key={report.room._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{report.room.name}</td>
                      <td className="px-4 py-3 text-gray-600">{report.room.building}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-foreground">
                          {report.room.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">{report.room.capacity}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{report.usedSlots}/42</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getUtilizationColor(report.utilizationPercent)}`}
                              style={{ width: `${report.utilizationPercent}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{report.utilizationPercent}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'faculty' && facultyData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UsersIcon />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Faculty</p>
                  <p className="text-2xl font-bold text-gray-900">{facultyData.summary.totalFaculty}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <ChartIcon />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{facultyData.summary.totalClasses}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ChartIcon />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Classes/Faculty</p>
                  <p className="text-2xl font-bold text-gray-900">{facultyData.summary.avgClassesPerFaculty}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <UsersIcon />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Optimal Load</p>
                  <p className="text-2xl font-bold text-gray-900">{facultyData.summary.distribution.optimal}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Workload Distribution */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Workload Distribution</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 bg-yellow-50">
                <p className="text-yellow-800 font-medium">Underloaded</p>
                <p className="text-3xl font-bold text-yellow-600">{facultyData.summary.distribution.underloaded}</p>
                <p className="text-sm text-yellow-600">&lt;70% of average</p>
              </div>
              <div className="border rounded-lg p-4 bg-green-50">
                <p className="text-green-800 font-medium">Optimal</p>
                <p className="text-3xl font-bold text-green-600">{facultyData.summary.distribution.optimal}</p>
                <p className="text-sm text-green-600">70-130% of average</p>
              </div>
              <div className="border rounded-lg p-4 bg-red-50">
                <p className="text-red-800 font-medium">Overloaded</p>
                <p className="text-3xl font-bold text-red-600">{facultyData.summary.distribution.overloaded}</p>
                <p className="text-sm text-red-600">&gt;130% of average</p>
              </div>
            </div>
          </div>

          {/* Faculty List */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Faculty Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Faculty</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-foreground">Classes</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-foreground">Subjects</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-foreground">Batches</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Daily Load</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {facultyData.faculty.map((report) => {
                    const status = getWorkloadStatus(report.totalClasses, facultyData.summary.avgClassesPerFaculty);
                    return (
                      <tr key={report.faculty._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{report.faculty.name}</p>
                            <p className="text-sm text-gray-500">{report.faculty.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-gray-900">{report.totalClasses}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{report.subjectCount}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{report.batchCount}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {DAY_NAMES.map((day, index) => (
                              <div
                                key={day}
                                className="w-8 h-8 rounded flex items-center justify-center text-xs font-medium bg-blue-100 text-blue-800"
                                title={day}
                              >
                                {report.byDay[index]}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">No data available</div>
      )}
    </div>
  );
}
