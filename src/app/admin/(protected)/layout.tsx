import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/app/actions/auth-actions';
import AdminSidebar from '@/components/layout/admin-sidebar';
import AdminHeader from '@/components/layout/admin-header';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const isLoggedIn = await isAuthenticated();

  if (!isLoggedIn) {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
