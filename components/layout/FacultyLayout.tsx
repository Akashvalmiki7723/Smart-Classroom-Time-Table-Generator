import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AIChatbot from '@/components/AIChatbot';

// Icons
const DashboardIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ScheduleIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const SubjectsIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const LeaveIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const facultyNavItems = [
  { label: 'Dashboard', href: '/faculty/dashboard', icon: <DashboardIcon /> },
  { label: 'My Schedule', href: '/faculty/schedule', icon: <ScheduleIcon /> },
  { label: 'My Subjects', href: '/faculty/subjects', icon: <SubjectsIcon /> },
  { label: 'Leave Management', href: '/faculty/leaves', icon: <LeaveIcon /> },
];

interface FacultyLayoutProps {
  children: React.ReactNode;
}

export default async function FacultyLayout({ children }: FacultyLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'faculty') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar items={facultyNavItems} />
      <div className="ml-64">
        <Navbar user={session.user} />
        <main className="p-6">{children}</main>
      </div>
      <AIChatbot 
        userRole="faculty" 
        departmentId={session.user.department?.toString()} 
      />
    </div>
  );
}
