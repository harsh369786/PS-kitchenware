"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Product, Category, SiteContent } from "@/lib/types";
import { getSiteContent } from "@/lib/site-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Package } from "lucide-react";
import ProductDetailModal from "@/components/product-detail-modal";
import OrderConfirmationDialog from "@/components/order-confirmation-dialog";
import { sendOrderEmail } from "@/app/actions/send-order-email";
import { addOrder } from "@/app/actions/order-actions";
import { useToast } from "@/hooks/use-toast";

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { toast } = useToast();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);

  useEffect(() => {
    async function fetchContent() {
      try {
        const content: SiteContent = await getSiteContent();
        const currentCategory = content.categories.find(
          (cat) => cat.href === `/category/${params.slug}`
        );

        if (currentCategory) {
          setCategory(currentCategory);
          const categoryProducts: Product[] = (currentCategory.subcategories || []).map(sub => ({
            id: sub.id,
            name: sub.name,
            imageUrl: sub.imageUrl || currentCategory.imageUrl,
            imageHint: sub.imageHint || currentCategory.imageHint,
          }));
          setProducts(categoryProducts);
        }
      } catch (error) {
        console.error("Failed to fetch site content", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchContent();
  }, [params.slug]);

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
      let absoluteImageUrl = product.imageUrl;
      if (absoluteImageUrl.startsWith('/')) {
        const host = process.env.NEXT_PUBLIC_HOST_URL || window.location.origin;
        absoluteImageUrl = new URL(absoluteImageUrl, host).href;
      }

      await addOrder({
        productName: product.name,
        quantity,
        imageUrl: absoluteImageUrl
      });

      await sendOrderEmail({
        productName: product.name,
        quantity,
        imageUrl: product.imageUrl,
      });

      setDetailModalOpen(false);
      setConfirmationOpen(true);
    } catch (error) {
      console.error("Failed to process order:", error);
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: "There was a problem processing your order. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold font-headline mb-8 text-center">{category.name}</h1>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden group">
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transform transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={product.imageHint}
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h4 className="font-semibold text-base mb-4 truncate">{product.name}</h4>
                    <Button onClick={() => handleProductClick(product)}>Buy Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-16">
             <Package className="w-16 h-16 mb-4 text-muted-foreground" />
             <p className="text-muted-foreground">No products found in this category yet.</p>
          </div>
        )}
      </div>

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
    </>
  );
}