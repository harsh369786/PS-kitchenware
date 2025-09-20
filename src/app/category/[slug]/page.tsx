import type { SiteContent, Category, Product } from "@/lib/types";
import { getSiteContent } from "@/lib/site-content";
import { Package } from "lucide-react";
import CategoryProductGrid from "@/components/category-product-grid";

async function getCategory(slug: string): Promise<{ category: Category | null, products: Product[] }> {
  try {
    const content: SiteContent = await getSiteContent();
    const currentCategory = content.categories.find(
      (cat) => cat.href === `/category/${slug}`
    );

    if (currentCategory) {
      const categoryProducts: Product[] = (currentCategory.subcategories || []).map(sub => ({
        id: sub.id,
        name: sub.name,
        imageUrl: sub.imageUrl || currentCategory.imageUrl, // Fallback to category image
        imageHint: sub.imageHint || currentCategory.imageHint || "", // Fallback to category hint
      }));
      return { category: currentCategory, products: categoryProducts };
    }
    return { category: null, products: [] };
  } catch (error) {
    console.error("Failed to fetch site content", error);
    return { category: null, products: [] };
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { category, products } = await getCategory(params.slug);

  if (!category) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center text-center">
          <Package className="w-16 h-16 mb-4 text-muted-foreground" />
          <h1 className="text-3xl font-bold font-headline mb-2">Category Not Found</h1>
          <p className="text-muted-foreground">The category you're looking for doesn't seem to exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold font-headline mb-8 text-center">{category.name}</h1>
      <CategoryProductGrid products={products} />
    </div>
  );
}
