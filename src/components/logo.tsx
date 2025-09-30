import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href="/" className="block w-[250px] h-[50px]">
      <Image 
        src="/logo.png" 
        alt="Ps Kitchenware Logo" 
        width={250} 
        height={50}
        priority
      />
    </Link>
  );
}
