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
        <h2 className="text-3xl font-bold text-center mb-12 font-headline">Categories</h2>
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category.id}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold">{category.name}</h3>
                <Button asChild variant="link">
                  <Link href={category.href}>View All</Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {category.subcategories?.map((subcategory) => (
                  <Link href={subcategory.href} key={subcategory.id} className="group">
                    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      <CardContent className="p-0">
                        <div className="relative aspect-video">
                          <Image
                            src={subcategory.imageUrl || category.imageUrl}
                            alt={subcategory.name}
                            fill
                            className="object-cover transform transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={subcategory.imageHint || category.imageHint}
                          />
                        </div>
                        <div className="p-4 text-center">
                          <h4 className="font-semibold text-base">{subcategory.name}</h4>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
