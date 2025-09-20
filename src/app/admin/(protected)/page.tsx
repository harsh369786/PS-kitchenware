import { redirect } from 'next/navigation';

export default function AdminPage() {
  // The root admin page should redirect to the dashboard.
  // The layout will handle the auth check.
  redirect('/admin/dashboard');
}
