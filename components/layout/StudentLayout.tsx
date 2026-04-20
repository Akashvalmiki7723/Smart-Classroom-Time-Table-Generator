import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from './Sidebar';
import Navbar from './Navbar';
import AIChatbot from '@/components/AIChatbot';

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default async function StudentLayout({ children }: StudentLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'student') {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <Sidebar
        userRole="student"
        userName={session.user.name || 'Student'}
        userEmail={session.user.email || ''}
      />
      <div className="flex flex-col flex-1" style={{ marginLeft: '56px' }}>
        <Navbar user={session.user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <AIChatbot 
        userRole="student" 
        userId={session.user.id}
        userName={session.user.name || 'Student'}
        departmentId={session.user.department?.toString()} 
      />
    </div>
  );
}
