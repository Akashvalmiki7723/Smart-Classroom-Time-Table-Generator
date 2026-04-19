'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Subject {
  _id: string;
  name: string;
  code: string;
  type: 'theory' | 'practical' | 'project';
  credits: number;
  semester: number;
  department: {
    name: string;
    code: string;
  };
  hoursPerWeek: number;
}

const BookIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

export default function FacultySubjectsPage() {
  const { data: session } = useSession();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/faculty/subjects');
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'theory':
        return 'bg-blue-100 text-blue-800';
      case 'practical':
        return 'bg-purple-100 text-purple-800';
      case 'project':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSubjects = filter === 'all' 
    ? subjects 
    : subjects.filter(s => s.type === filter);

  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  const totalHours = subjects.reduce((sum, s) => sum + s.hoursPerWeek, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Subjects</h1>
        <p className="text-gray-500 mt-1">View all subjects assigned to you</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <BookIcon />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg text-green-600">
              <BookIcon />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Credits</p>
              <p className="text-2xl font-bold text-gray-900">{totalCredits}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
              <BookIcon />
            </div>
            <div>
              <p className="text-sm text-gray-500">Hours/Week</p>
              <p className="text-2xl font-bold text-gray-900">{totalHours}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'theory', 'practical', 'project'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === type
                ? 'bg-blue-600 text-white'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookIcon />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Assigned</h3>
          <p className="text-gray-500">You have not been assigned any subjects yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSubjects.map((subject) => (
            <div key={subject._id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                  <p className="text-gray-500">{subject.code}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getTypeColor(subject.type)}`}>
                  {subject.type}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Semester</span>
                  <span className="font-medium">{subject.semester}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Credits</span>
                  <span className="font-medium">{subject.credits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hours/Week</span>
                  <span className="font-medium">{subject.hoursPerWeek}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Department</span>
                  <span className="font-medium">{subject.department?.code || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
