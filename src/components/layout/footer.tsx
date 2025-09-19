import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex space-x-6 text-sm text-muted-foreground">
            <Link href="/customer-service" className="hover:text-foreground transition-colors">Customer Service</Link>
            <Link href="/shipping" className="hover:text-foreground transition-colors">Shipping</Link>
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
          <div className="flex space-x-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Facebook size={20} /></Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Twitter size={20} /></Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Instagram size={20} /></Link>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>No exchange or returns</p>
          <p className="mt-2">&copy; {new Date().getFullYear()} PS Essentials. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
