import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PS Essentials Admin',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // This layout wrapper ensures that the main site's header and footer
  // are not displayed on any admin pages.
  return <>{children}</>;
}
