import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/types";

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="py-16 sm:py-24 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12 font-headline">Shop by Category</h2>
        <div className="space-y-16">
          {categories.map((category) => (
            <div key={category.id}>
              <div className="flex justify-between items-baseline mb-6">
                <h3 className="text-2xl font-semibold">{category.name}</h3>
                <Button asChild variant="link" className="text-base">
                  <Link href={category.href}>View All</Link>
                </Button>
              </div>
              <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden group">
                 <Link href={category.href}>
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover transform transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={category.imageHint}
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                 </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}