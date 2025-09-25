"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";
import ProductDetailModal from "@/components/product-detail-modal";

interface CategoryProductGridProps {
    products: Product[];
}

export default function CategoryProductGrid({ products }: CategoryProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedProduct(null);
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
                    <h4 className="font-semibold text-base mb-2 truncate">{product.name}</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      {product.price ? `₹${product.price}` : 'From ₹...'}
                    </p>
                    <Button onClick={() => handleProductClick(product)} className="bg-primary hover:bg-primary/90">Shop Now</Button>
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
        />
      )}
    </>
  );
}
