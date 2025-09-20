"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";
import ProductDetailModal from "@/components/product-detail-modal";
import OrderConfirmationDialog from "@/components/order-confirmation-dialog";
import { sendOrderEmail } from "@/app/actions/send-order-email";
import { addOrder } from "@/app/actions/order-actions";
import { useToast } from "@/hooks/use-toast";

interface CategoryProductGridProps {
    products: Product[];
}

export default function CategoryProductGrid({ products }: CategoryProductGridProps) {
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

  return (
    <>
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
