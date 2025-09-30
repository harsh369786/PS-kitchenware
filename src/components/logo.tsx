import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href="/">
      <Image 
        src="/logo.png" 
        alt="Ps Kitchenware Logo" 
        width={250} 
        height={50}
        priority
        className="h-auto"
      />
    </Link>
  );
}
