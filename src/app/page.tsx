import type { Product, SiteContent } from "@/lib/types";
import { getSiteContent } from "@/lib/site-content";
import HomePageClient from "@/components/home-page-client";

// Force dynamic rendering so we always get fresh content
export const dynamic = 'force-dynamic';

export default async function Home() {
  const siteContent: SiteContent = await getSiteContent();

  // Resolve hero products on the server so image URLs appear in initial HTML
  const heroProductsWithDetails: Product[] = siteContent.heroProducts.map(heroProduct => {
    let baseProduct: Product | undefined;
    for (const category of siteContent.categories) {
      const found = category.subcategories?.find(sub => sub.id === heroProduct.productId);
      if (found) {
        baseProduct = {
          id: found.id,
          name: found.name,
          imageUrl: found.imageUrl || found.imageUrls?.[0] || category.imageUrl,
          imageUrls: found.imageUrls || (found.imageUrl ? [found.imageUrl] : []),
          imageHint: found.imageHint || category.imageHint || '',
          price: found.price,
          sizes: found.sizes
        };
        break;
      }
    }

    if (!baseProduct) {
      return {
        id: heroProduct.productId,
        name: 'Product not found',
        imageUrl: '',
        imageHint: ''
      };
    }

    return {
      ...baseProduct,
      imageUrl: heroProduct.imageUrl || baseProduct.imageUrl,
      imageHint: heroProduct.imageHint || baseProduct.imageHint,
      tagline: heroProduct.tagline
    };
  });

  return (
    <HomePageClient
      categories={siteContent.categories}
      heroProducts={heroProductsWithDetails}
      allCategories={siteContent.categories}
    />
  );
}
