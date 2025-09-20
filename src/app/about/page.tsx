import { Building, Mail, Phone } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <Building className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl">
            About Us
          </h1>
        </div>
        
        <div className="prose prose-lg mx-auto text-foreground">
          <p>We are a manufacturer & trader.</p>
          <p>
            At Ps essentials, we craft high quality stainless steel kitchenware designed to make cooking and serving effortless. Our products are trusted by hotels, restaurants, and households for their durability, elegance, and modern design.
          </p>
          <p>
            With a focus on quality, innovation, and timely delivery, we bring you reliable kitchen essentials that blend style with everyday functionality. Whether it’s premium serving items or versatile cooking tools, we are here to elevate your kitchen experience.
          </p>
        </div>

        <div className="mt-16 pt-12 border-t">
            <h2 className="text-3xl font-bold font-headline text-center mb-8">Contact Info</h2>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
                <div className="flex items-center gap-3">
                    <Mail className="h-6 w-6 text-primary" />
                    <a href="mailto:Psessentials11@gmail.com" className="text-lg text-foreground hover:underline">
                        Psessentials11@gmail.com
                    </a>
                </div>
                <div className="flex items-center gap-3">
                    <Phone className="h-6 w-6 text-primary" />
                    <a href="tel:8879529113" className="text-lg text-foreground hover:underline">
                        8879529113
                    </a>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
