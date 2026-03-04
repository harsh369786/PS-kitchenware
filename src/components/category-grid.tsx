import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/types";

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section id="categories" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12 font-headline uppercase tracking-wider">
          Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {categories.map((category) => (
            <Link key={category.id} href={category.href} className="group">
              <div className="relative aspect-square w-full rounded-lg overflow-hidden">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  className="object-cover transform transition-transform duration-500 group-hover:scale-110"
                  data-ai-hint={category.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
                  <h3 className="text-xl font-bold uppercase tracking-widest">
                    {category.name}
                  </h3>
                  <Button
                    variant="default"
                    className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary hover:bg-primary/90"
                  >
                    Shop Now
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
