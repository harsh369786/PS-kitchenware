import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PS Essentials Admin',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // This layout is now a simple wrapper and does not perform auth checks
  return <>{children}</>;
}
