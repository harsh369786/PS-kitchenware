"use client";

import { useState, useEffect } from "react";
import type { Product, Category, SiteContent } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import HeroCarousel from "@/components/hero-carousel";
import ProductScroll from "@/components/product-scroll";
import CategoryGrid from "@/components/category-grid";
import ProductDetailModal from "@/components/product-detail-modal";
import OrderConfirmationDialog from "@/components/order-confirmation-dialog";
import { sendOrderEmail } from "@/app/actions/send-order-email";
import { useToast } from "@/hooks/use-toast";
import { getSiteContent } from "@/lib/site-content";

const scrollProductsData: Product[] = PlaceHolderImages.filter((p) =>
  p.id.startsWith("scroll-")
).map((p, i) => ({
  id: p.id,
  name: `New Arrival ${i + 1}`,
  imageUrl: p.imageUrl,
  imageHint: p.imageHint,
}));

export default function Home() {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);

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

  const handleBuyNow = async (product: Product, quantity: number) => {
    try {
      await sendOrderEmail({
        productName: product.name,
        quantity,
        imageUrl: product.imageUrl,
      });
      setDetailModalOpen(false);
      setConfirmationOpen(true);
    } catch (error) {
      console.error("Failed to send order email:", error);
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: "There was a problem processing your order. Please try again.",
      });
    }
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
      <ProductScroll products={scrollProductsData} onProductClick={handleProductClick} />
      <CategoryGrid categories={siteContent.categories} />
      
      {selectedProduct && (
        <ProductDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          product={selectedProduct}
          onBuyNow={handleBuyNow}
        />
      )}

      <OrderConfirmationDialog
        isOpen={isConfirmationOpen}
        onClose={() => setConfirmationOpen(false)}
      />
    </div>
  );
}
