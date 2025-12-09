
import type { SiteContent, Category, Product } from "@/lib/types";
import { getSiteContent } from "@/lib/site-content";
import CategoryProductGrid from "@/components/category-product-grid";
import { notFound } from "next/navigation";

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  try {
    const content: SiteContent = await getSiteContent();
    return content.categories.map((category) => ({
      slug: category.href.split('/').pop() || '',
    }));
  } catch (error) {
    console.error("Failed to generate static params for categories", error);
    return [];
  }
}

async function getCategory(slug: string): Promise<{ category: Category | null, products: Product[] }> {
  try {
    const content: SiteContent = await getSiteContent();
    const currentCategory = content.categories.find(
      (cat) => cat.href === `/category/${slug}`
    );

    if (!currentCategory) {
      return { category: null, products: [] };
    }
    
    const categoryProducts: Product[] = (currentCategory.subcategories || []).map(sub => ({
      id: sub.id,
      name: sub.name,
      imageUrl: sub.imageUrl || currentCategory.imageUrl, 
      imageHint: sub.imageHint || currentCategory.imageHint || "",
      price: sub.price,
      sizes: sub.sizes,
    }));
    return { category: currentCategory, products: categoryProducts };

  } catch (error) {
    console.error("Failed to fetch site content", error);
    return { category: null, products: [] };
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { category, products } = await getCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold font-headline mb-8 text-center">{category.name}</h1>
      <CategoryProductGrid products={products} />
    </div>
  );
}
