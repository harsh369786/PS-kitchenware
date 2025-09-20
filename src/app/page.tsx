"use client";

import { useState, useEffect } from "react";
import type { Product, Category, SiteContent } from "@/lib/types";
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
    setSelectedProduct(product);
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
