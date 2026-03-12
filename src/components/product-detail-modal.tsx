
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product, ProductSize } from "@/lib/types";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Package, Minus, Plus } from "lucide-react";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export default function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(undefined);
  const [displayPrice, setDisplayPrice] = useState<number | undefined>(product.price);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const validSizes = product.sizes?.filter(s => s && s.name && s.name.trim() !== '') || [];
  const hasSizes = validSizes.length > 0;

  // Build image list from imageUrls or fallback to imageUrl
  const images = (product.imageUrls?.filter(u => u && u.trim() !== '') || []);
  if (images.length === 0 && product.imageUrl) {
    images.push(product.imageUrl);
  }

  useEffect(() => {
    // Reset state when modal opens or product changes
    if (isOpen) {
      setQuantity(1);
      setCurrentImageIndex(0);
      setIsTransitioning(false);
      if (hasSizes) {
        setSelectedSize(undefined);
        setDisplayPrice(undefined);
      } else {
        setSelectedSize(undefined); 
        setDisplayPrice(product.price);
      }
    }
  }, [isOpen, product, hasSizes]);

  // Auto-scroll images in the modal
  useEffect(() => {
    if (!isOpen || images.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
        setIsTransitioning(false);
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen, images.length]);


  const handleSizeChange = (sizeName: string) => {
    const newSize = validSizes.find(s => s.name === sizeName);
    setSelectedSize(newSize);
    setDisplayPrice(newSize?.price);
  };
  
  const handleAddToCartClick = () => {
    if (hasSizes && !selectedSize) {
      toast({
        variant: "destructive",
        title: "Please select a size.",
      });
      return;
    }
    
    if (quantity > 0) {
      const price = selectedSize?.price ?? product.price ?? 0;
      addToCart({ ...product, price }, quantity, selectedSize?.name);
      toast({
        title: "Added to Cart",
        description: `${quantity} x ${product.name}${selectedSize?.name ? ` (Size: ${selectedSize.name})` : ''} has been added to your cart.`,
      });
      onClose();
    }
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[600px] p-0 max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-56 sm:h-64 md:h-full min-h-[220px] md:min-h-[300px]">
            {images.length > 0 ? (
              <>
                <Image
                  src={images[currentImageIndex]}
                  alt={product.name}
                  fill
                  className={`object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
                  sizes="(max-width: 768px) 95vw, 300px"
                  quality={80}
                  data-ai-hint={product.imageHint}
                />
                {/* Dot indicators */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setCurrentImageIndex(i); }}
                        className={`h-2 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-white w-5' : 'bg-white/50 w-2'}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-t-none">
                <Package className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
          </div>
          <div className="p-4 sm:p-6 flex flex-col justify-center">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold font-headline">{product.name}</DialogTitle>
              {product.tagline && <DialogDescription>{product.tagline}</DialogDescription>}
            </DialogHeader>

            <div className="py-4 sm:py-6 space-y-3 sm:space-y-4">
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                 {displayPrice !== undefined ? `₹${displayPrice.toFixed(2)}` : 'Select a size'}
              </div>

              {hasSizes && (
                <div className="flex items-center space-x-4">
                   <label htmlFor="size" className="text-sm font-medium">Size</label>
                   <Select onValueChange={handleSizeChange} value={selectedSize?.name}>
                    <SelectTrigger id="size" className="w-full h-10">
                      <SelectValue placeholder="Select a size" />
                    </SelectTrigger>
                    <SelectContent>
                      {validSizes.map((size, index) => (
                        <SelectItem key={`${size.name}-${index}`} value={size.name!}>
                          {size.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <label htmlFor="quantity" className="text-sm font-medium">Qty</label>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-none" onClick={decrementQuantity} disabled={quantity <= 1}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity > 0 ? quantity : ""}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value) && value > 0) setQuantity(value);
                      else if (e.target.value === '') setQuantity(0);
                    }}
                    className="w-14 text-center border-0 rounded-none h-10 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-none" onClick={incrementQuantity}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <Button onClick={handleAddToCartClick} size="lg" className="bg-primary hover:bg-primary/90 w-full h-12 text-base" disabled={quantity <= 0 || (hasSizes && !selectedSize)}>
                Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
