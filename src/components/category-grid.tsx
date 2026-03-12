import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/types";

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section id="categories" className="py-10 sm:py-16 md:py-24 bg-background" aria-label="Product Categories">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 font-headline uppercase tracking-wider">
          Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-8">
          {categories.map((category, index) => (
            <Link key={category.id} href={category.href} className="group" prefetch={false}>
              <div className="relative aspect-square w-full rounded-lg overflow-hidden">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  loading={index < 3 ? 'eager' : 'lazy'}
                  className="object-cover transform transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  quality={75}
                  data-ai-hint={category.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-2 sm:p-4">
                  <h3 className="text-sm sm:text-base md:text-xl font-bold uppercase tracking-wider sm:tracking-widest leading-tight">
                    {category.name}
                  </h3>
                  <Button
                    variant="default"
                    size="sm"
                    className="mt-2 sm:mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary hover:bg-primary/90 text-xs sm:text-sm hidden sm:inline-flex"
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
