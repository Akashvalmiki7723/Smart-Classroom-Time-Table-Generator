import dbConnect from '@/lib/db';
import User from '@/models/User';
import Department from '@/models/Department';
import Subject from '@/models/Subject';
import Room from '@/models/Room';
import Link from 'next/link';
import { Users, Building2, BookOpen, DoorOpen } from 'lucide-react';

async function getStats() {
  await dbConnect();

  const [usersCount, departmentsCount, subjectsCount, roomsCount, recentUsers] = await Promise.all([
    User.countDocuments(),
    Department.countDocuments(),
    Subject.countDocuments(),
    Room.countDocuments(),
    User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  return { usersCount, departmentsCount, subjectsCount, roomsCount, recentUsers };
}

const roleBadgeStyle: Record<string, React.CSSProperties> = {
  admin:       { background: 'var(--lavender-light)', color: 'var(--purple-dark)' },
  hod:         { background: 'var(--teal-light)',     color: 'var(--teal-dark)' },
  coordinator: { background: 'var(--cream)',           color: '#7B6FAF' },
  faculty:     { background: '#EEF5F0',               color: '#4A7A5A' },
  student:     { background: '#FEF3E2',               color: '#B8720A' },
};

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    { title: 'Total Users', value: stats.usersCount, href: '/admin/users', icon: <Users className="w-5 h-5" />, color: 'var(--purple)' },
    { title: 'Departments', value: stats.departmentsCount, href: '/admin/departments', icon: <Building2 className="w-5 h-5" />, color: 'var(--teal-dark)' },
    { title: 'Subjects', value: stats.subjectsCount, href: '/admin/subjects', icon: <BookOpen className="w-5 h-5" />, color: 'var(--lavender-dark, var(--purple))' },
    { title: 'Rooms', value: stats.roomsCount, href: '/admin/rooms', icon: <DoorOpen className="w-5 h-5" />, color: '#7B9E87' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Welcome back! Here&apos;s an overview of Presidency University.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => (
          <Link href={card.href} key={card.title}>
            <div
              className="rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--cream)', color: card.color }}
                >
                  {card.icon}
                </div>
              </div>
              <p className="text-3xl font-bold mb-1" style={{ color: card.color }}>
                {card.value}
              </p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {card.title}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/users/new"
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--purple), var(--lavender))' }}
          >
            + Create User
          </Link>
          <Link
            href="/admin/departments/new"
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'var(--teal-light)',
              color: 'var(--teal-dark)',
              border: '1px solid var(--teal)',
            }}
          >
            + Add Department
          </Link>
          <Link
            href="/admin/users"
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'var(--cream)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            View All Users
          </Link>
        </div>
      </div>

      {/* Recent Users */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Recently Joined Users
          </h2>
          <Link
            href="/admin/users"
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--purple)' }}
          >
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Name</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Email</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((user) => (
                <tr key={String(user._id)} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td className="py-3.5 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {user.name}
                  </td>
                  <td className="py-3.5 px-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {user.email}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                      style={roleBadgeStyle[user.role as string] || roleBadgeStyle.student}
                    >
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
