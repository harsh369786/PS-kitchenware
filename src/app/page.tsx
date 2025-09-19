"use client";

import { useState } from "react";
import type { Product, Category } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import HeroCarousel from "@/components/hero-carousel";
import ProductScroll from "@/components/product-scroll";
import CategoryGrid from "@/components/category-grid";
import ProductDetailModal from "@/components/product-detail-modal";
import OrderConfirmationDialog from "@/components/order-confirmation-dialog";
import { sendOrderEmail } from "@/app/actions/send-order-email";
import { useToast } from "@/hooks/use-toast";

const heroProductsData: Product[] = PlaceHolderImages.filter((p) =>
  p.id.startsWith("hero-")
).map((p, i) => ({
  id: p.id,
  name: `Product Example ${i + 1}`,
  tagline: `Essential for your modern home`,
  imageUrl: p.imageUrl,
  imageHint: p.imageHint,
}));

const scrollProductsData: Product[] = PlaceHolderImages.filter((p) =>
  p.id.startsWith("scroll-")
).map((p, i) => ({
  id: p.id,
  name: `New Arrival ${i + 1}`,
  imageUrl: p.imageUrl,
  imageHint: p.imageHint,
}));

const categoriesData: Category[] = [
  { id: "cat-laddles", name: "Laddles and Palta’s", href: "/category/laddles", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-laddles')?.imageUrl || '', imageHint: 'laddles kitchen' },
  { id: "cat-doyas", name: "Doya’s", href: "/category/doyas", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-doyas')?.imageUrl || '', imageHint: 'serving spoon' },
  { id: "cat-jaras", name: "Jara’s", href: "/category/jaras", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-jaras')?.imageUrl || '', imageHint: 'slotted spoon' },
  { id: "cat-steamers", name: "Steamer and Washer", href: "/category/steamers", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-steamers')?.imageUrl || '', imageHint: 'steamer pot' },
  { id: "cat-vati", name: "Vati and Plates", href: "/category/vati-plates", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-vati')?.imageUrl || '', imageHint: 'bowls plates' },
  { id: "cat-glasses", name: "Glasses", href: "/category/glasses", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-glasses')?.imageUrl || '', imageHint: 'drinking glasses' },
  { id: "cat-others", name: "Others", href: "/category/others", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-others')?.imageUrl || '', imageHint: 'kitchenware various' },
].map(cat => ({ ...cat, imageUrl: cat.imageUrl || `https://picsum.photos/seed/${cat.id}/600/400` }));

export default function Home() {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);

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

  return (
    <div className="bg-background">
      <HeroCarousel products={heroProductsData} onProductClick={handleProductClick} />
      <ProductScroll products={scrollProductsData} onProductClick={handleProductClick} />
      <CategoryGrid categories={categoriesData} />
      
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
