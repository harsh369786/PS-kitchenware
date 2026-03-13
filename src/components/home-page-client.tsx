
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Product, Category } from "@/lib/types";
import HeroCarousel from "@/components/hero-carousel";
import CategoryGrid from "@/components/category-grid";

// Lazy-load the modal — not needed until user clicks "Shop Now"
const ProductDetailModal = dynamic(() => import("@/components/product-detail-modal"), { ssr: false });

interface HomePageClientProps {
  categories: Category[];
  heroProducts: Product[];
  allCategories: Category[];
}

export default function HomePageClient({ categories, heroProducts, allCategories }: HomePageClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);

  const handleProductClick = (product: Product) => {
    let fullProduct: Product | undefined = undefined;

    // Search for the product in subcategories to get its full details (sizes, price etc)
    for (const category of allCategories) {
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
    
    if(!fullProduct) {
        fullProduct = { ...product };
    }

    setSelectedProduct(fullProduct);
    setDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="bg-background">
      {heroProducts.length > 0 && (
          <HeroCarousel products={heroProducts} onProductClick={handleProductClick} />
      )}
      <CategoryGrid categories={categories} />
      
      {selectedProduct && (
        <ProductDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          product={selectedProduct}
        />
      )}
    </div>
  );
}
