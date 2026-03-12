"use client";

import { useState, useEffect, memo } from "react";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";
import ProductDetailModal from "@/components/product-detail-modal";

// Auto-scrolling image component for products with multiple images
const AutoScrollImage = memo(function AutoScrollImage({ product }: { product: Product }) {
    const images = product.imageUrls?.filter(u => u && u.trim() !== '') || [];
    // Fall back to single imageUrl if no imageUrls
    if (images.length === 0 && product.imageUrl) {
        images.push(product.imageUrl);
    }

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentIndex(prev => (prev + 1) % images.length);
                setIsTransitioning(false);
            }, 300);
        }, 2500);

        return () => clearInterval(interval);
    }, [images.length]);

    if (images.length === 0) {
        return (
            <div className="w-full h-full bg-muted flex items-center justify-center">
                <Package className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground/30" />
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            <Image
                src={images[currentIndex]}
                alt={product.name}
                fill
                className={`object-cover transform transition-all duration-300 group-hover:scale-105 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
                data-ai-hint={product.imageHint}
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                quality={75}
                loading="lazy"
            />
            {/* Dot indicators for multiple images */}
            {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {images.map((_, i) => (
                        <span
                            key={i}
                            className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});

export default function CategoryProductGrid({ products }: { products: Product[] }) {
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
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                    {products.map((product) => (
                        <Card key={product.id} className="overflow-hidden group">
                            <CardContent className="p-0">
                                <div className="relative aspect-square">
                                    <AutoScrollImage product={product} />
                                </div>
                                <div className="p-2 sm:p-4 text-center">
                                    <h4 className="font-semibold text-xs sm:text-sm md:text-base mb-1 sm:mb-2 truncate">{product.name}</h4>
                                    <p className="text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-4">
                                        {product.price ? `₹${product.price}` : 'From ₹...'}
                                    </p>
                                    <Button 
                                        onClick={() => handleProductClick(product)} 
                                        className="bg-primary hover:bg-primary/90 text-xs sm:text-sm h-8 sm:h-10"
                                        size="sm"
                                    >
                                        Shop Now
                                    </Button>
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
