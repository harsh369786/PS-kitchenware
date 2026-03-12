

"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import type { Product, SiteContent, HeroProduct } from "@/lib/types";
import HeroCarousel from "@/components/hero-carousel";
import CategoryGrid from "@/components/category-grid";
import { getSiteContent } from "@/lib/site-content";

// Lazy load heavy modal components — they're not needed at initial paint
const ProductDetailModal = dynamic(() => import("@/components/product-detail-modal"), { ssr: false });
const OrderConfirmationDialog = dynamic(() => import("@/components/order-confirmation-dialog"), { ssr: false });

function HomeSkeleton() {
  return (
    <div className="bg-background">
      {/* Hero skeleton */}
      <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] skeleton-shimmer" />
      {/* Categories skeleton */}
      <div className="py-10 sm:py-16 md:py-24">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="h-8 w-48 mx-auto mb-8 sm:mb-12 skeleton-shimmer rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg skeleton-shimmer" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);


  const fetchContent = async () => {
    const content = await getSiteContent();
    setSiteContent(content);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleProductClick = (product: Product) => {
    if (!siteContent) return;

    let fullProduct: Product | undefined = undefined;

    // Search for the product in subcategories to get its full details (sizes, price etc)
    // This is the source of truth for all product details.
    for (const category of siteContent.categories) {
      if (category.subcategories) {
        const foundSubcategory = category.subcategories.find(sub => sub.id === product.id);
        if (foundSubcategory) {
          fullProduct = {
            id: foundSubcategory.id,
            name: foundSubcategory.name,
            imageUrl: product.imageUrl,
            imageUrls: foundSubcategory.imageUrls || (foundSubcategory.imageUrl ? [foundSubcategory.imageUrl] : []),
            imageHint: product.imageHint,
            price: foundSubcategory.price,
            sizes: foundSubcategory.sizes,
            tagline: product.tagline
          };
          break;
        }
      }
    }
    
    // Fallback to the clicked product data if not found in categories (should not happen for hero products)
    if(!fullProduct) {
        fullProduct = { ...product };
    }

    setSelectedProduct(fullProduct);
    setDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedProduct(null);
    // Refetch content when modal is closed to see updates from admin panel
    fetchContent();
  };


  if (!siteContent) {
    return <HomeSkeleton />;
  }

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
      }
    }

    return {
      ...baseProduct,
      imageUrl: heroProduct.imageUrl || baseProduct.imageUrl,
      imageHint: heroProduct.imageHint || baseProduct.imageHint,
      tagline: heroProduct.tagline
    }
  });

  return (
    <div className="bg-background">
      <HeroCarousel products={heroProductsWithDetails} onProductClick={handleProductClick} />
      <CategoryGrid categories={siteContent.categories} />
      
      {selectedProduct && (
        <ProductDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          product={selectedProduct}
        />
      )}

      <OrderConfirmationDialog
        isOpen={isConfirmationOpen}
        onClose={() => setConfirmationOpen(false)}
      />
    </div>
  );
}
