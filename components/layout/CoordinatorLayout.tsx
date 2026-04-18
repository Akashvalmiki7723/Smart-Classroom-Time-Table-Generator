import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from './Sidebar';
import Navbar from './Navbar';
import AIChatbot from '@/components/AIChatbot';

interface CoordinatorLayoutProps {
  children: React.ReactNode;
}

export default async function CoordinatorLayout({ children }: CoordinatorLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'coordinator') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <Sidebar
        userRole="coordinator"
        userName={session.user.name || 'Coordinator'}
        userEmail={session.user.email || ''}
      />
      <div className="flex flex-col flex-1" style={{ marginLeft: '56px' }}>
        <Navbar user={session.user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <AIChatbot 
        userRole="coordinator" 
        departmentId={session.user.department?.toString()} 
      />
    </div>
  );
}
