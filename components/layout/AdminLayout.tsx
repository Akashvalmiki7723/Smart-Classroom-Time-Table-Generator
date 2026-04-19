import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from './Sidebar';
import Navbar from './Navbar';
import AIChatbot from '@/components/AIChatbot';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'admin') redirect('/');

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <Sidebar
        userRole="admin"
        userName={session.user.name || 'Admin'}
        userEmail={session.user.email || ''}
      />
      <div className="flex flex-col flex-1" style={{ marginLeft: '56px' }}>
        <Navbar user={session.user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <AIChatbot userRole="admin" userId={session.user.id} userName={session.user.name || 'Admin'} />
    </div>
  );
}
