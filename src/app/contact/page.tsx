import { Mail } from 'lucide-react';
import ContactForm from '@/components/contact-form';

export default function ContactPage() {
  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-12">
          <Mail className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Have a question or a special request? Fill out the form below and we'll get back to you.
          </p>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
