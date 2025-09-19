import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center justify-center h-[70px] w-[250px]">
      <span className="text-3xl font-bold tracking-tight text-foreground">
        PS Essentials
      </span>
    </Link>
  );
}
