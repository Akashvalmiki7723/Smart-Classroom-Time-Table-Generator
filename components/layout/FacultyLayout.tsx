import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from './Sidebar';
import Navbar from './Navbar';
import AIChatbot from '@/components/AIChatbot';

interface FacultyLayoutProps {
  children: React.ReactNode;
}

export default async function FacultyLayout({ children }: FacultyLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'faculty') {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <Sidebar
        userRole="faculty"
        userName={session.user.name || 'Faculty'}
        userEmail={session.user.email || ''}
      />
      <div className="flex flex-col flex-1" style={{ marginLeft: '56px' }}>
        <Navbar user={session.user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <AIChatbot 
        userRole="faculty" 
        userId={session.user.id}
        userName={session.user.name || 'Faculty'}
        departmentId={session.user.department?.toString()} 
      />
    </div>
  );
}
