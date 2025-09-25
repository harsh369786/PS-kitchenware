
"use client";

import { useState, useEffect } from "react";
import type { Product, Category, SiteContent, ProductSize } from "@/lib/types";
import HeroCarousel from "@/components/hero-carousel";
import CategoryGrid from "@/components/category-grid";
import ProductDetailModal from "@/components/product-detail-modal";
import OrderConfirmationDialog from "@/components/order-confirmation-dialog";
import { getSiteContent } from "@/lib/site-content";

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);


  useEffect(() => {
    async function fetchContent() {
      const content = await getSiteContent();
      setSiteContent(content);
    }
    fetchContent();
  }, []);

  const handleProductClick = (product: Product) => {
    if (!siteContent) return;

    let fullProduct: Product | undefined = undefined;

    // Search for the product in subcategories to get its full details (sizes, price etc)
    for (const category of siteContent.categories) {
      if (category.subcategories) {
        const foundSubcategory = category.subcategories.find(sub => sub.name === product.name);
        if (foundSubcategory) {
          fullProduct = {
            id: foundSubcategory.id,
            name: foundSubcategory.name,
            imageUrl: foundSubcategory.imageUrl || category.imageUrl,
            imageHint: foundSubcategory.imageHint || category.imageHint || "",
            price: foundSubcategory.price,
            sizes: foundSubcategory.sizes,
            tagline: product.tagline // Keep hero tagline if it exists
          };
          break;
        }
      }
    }

    // If not found in subcategories, it might be a hero-only product.
    // Check if the hero product itself has sizes defined.
    if (!fullProduct) {
        const heroProduct = siteContent.heroProducts.find(p => p.id === product.id);
        if (heroProduct) {
            fullProduct = heroProduct;
        }
    }
    
    // Fallback to the clicked product data.
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


  if (!siteContent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <HeroCarousel products={siteContent.heroProducts} onProductClick={handleProductClick} />
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
