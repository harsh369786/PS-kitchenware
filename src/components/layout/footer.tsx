import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";
import ContactForm from "@/components/contact-form";

export default function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl font-bold font-headline mb-4">Contact Us</h2>
            <p className="text-muted-foreground mb-6">Have a question or a special request? Fill out the form and we'll get back to you.</p>
            <ContactForm />
          </div>
          <div className="flex flex-col justify-between h-full pt-12 md:pt-0">
             <div className="md:pl-4">
                <h2 className="text-2xl font-bold font-headline mb-4">Follow Us</h2>
                 <div className="flex space-x-4">
                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Facebook size={24} /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Twitter size={24} /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Instagram size={24} /></Link>
                </div>
            </div>
            <div className="mt-8 text-sm text-muted-foreground md:pl-4">
              <p className="font-bold">No exchange or returns</p>
              <p className="mt-2">&copy; {new Date().getFullYear()} PS Essentials. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
