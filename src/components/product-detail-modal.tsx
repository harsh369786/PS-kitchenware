"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onBuyNow: (product: Product, quantity: number) => Promise<void>;
}

export default function ProductDetailModal({ isOpen, onClose, product, onBuyNow }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBuyNowClick = async () => {
    setIsSubmitting(true);
    await onBuyNow(product, quantity);
    setIsSubmitting(false);
  };

  const quantityOptions = Array.from({ length: 300 }, (_, i) => i + 1);

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
              <div className="flex items-center space-x-4">
                <label htmlFor="quantity" className="text-sm font-medium">Quantity</label>
                <Select value={String(quantity)} onValueChange={(val) => setQuantity(Number(val))}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Qty" />
                  </SelectTrigger>
                  <SelectContent>
                    {quantityOptions.map(q => (
                      <SelectItem key={q} value={String(q)}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleBuyNowClick} size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Buy Now"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
