"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import type { Product } from "@/lib/types";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export default function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const hasSizes = product.sizes && product.sizes.length > 0;

  useEffect(() => {
    // Reset state when modal opens or product changes
    if (isOpen) {
      setQuantity(1);
      setSelectedSize(undefined);
    }
  }, [isOpen, product]);


  const handleAddToCartClick = () => {
    if (hasSizes && !selectedSize) {
      toast({
        variant: "destructive",
        title: "Please select a size.",
      });
      return;
    }
    
    if (quantity > 0) {
      addToCart({ ...product }, quantity, selectedSize);
      toast({
        title: "Added to Cart",
        description: `${quantity} x ${product.name}${selectedSize ? ` (Size: ${selectedSize})` : ''} has been added to your cart.`,
      });
      onClose();
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
        setQuantity(value);
    } else if (e.target.value === '') {
        setQuantity(0);
    }
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-64 md:h-full min-h-[300px]">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
              data-ai-hint={product.imageHint}
            />
          </div>
          <div className="p-6 flex flex-col justify-center">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold font-headline">{product.name}</DialogTitle>
            </DialogHeader>
            <div className="py-6 space-y-4">
              {hasSizes && (
                <div className="flex items-center space-x-4">
                   <label htmlFor="size" className="text-sm font-medium">Size</label>
                   <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger id="size" className="w-full">
                      <SelectValue placeholder="Select a size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes!.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center space-x-4">
                <label htmlFor="quantity" className="text-sm font-medium">Quantity</label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity > 0 ? quantity : ""}
                  onChange={handleQuantityChange}
                  className="w-24 text-center"
                />
              </div>
            </div>
            <Button onClick={handleAddToCartClick} size="lg" className="bg-primary hover:bg-primary/90" disabled={quantity <= 0 || (hasSizes && !selectedSize)}>
                Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
