import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center justify-center h-auto">
      <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        PS Essentials
      </span>
    </Link>
  );
}
