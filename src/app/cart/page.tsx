
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, ShoppingCart } from "lucide-react";
import { sendOrderEmail } from "@/app/actions/send-order-email";
import { addOrder } from "@/app/actions/order-actions";
import OrderConfirmationDialog from "@/components/order-confirmation-dialog";
import type { CartItem } from "@/lib/types";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const router = useRouter();

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity >= 1) {
      updateQuantity(productId, quantity);
    }
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    try {
      // Add each cart item as a separate order
      for (const item of cart) {
        let absoluteImageUrl = item.imageUrl;
         if (absoluteImageUrl.startsWith('/')) {
            const host = process.env.NEXT_PUBLIC_HOST_URL || window.location.origin;
            absoluteImageUrl = new URL(absoluteImageUrl, host).href;
        }

        await addOrder({
            productName: item.name,
            quantity: item.quantity,
            imageUrl: absoluteImageUrl
        });
      }
      
      // Send a single email with all cart items
      await sendOrderEmail({ cartItems: cart });
      
      setOrderPlaced(true);
      clearCart();
      setConfirmationOpen(true);
    } catch (error) {
      console.error("Failed to confirm order:", error);
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: "There was a problem confirming your order. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCloseConfirmation = () => {
    setConfirmationOpen(false);
    setOrderPlaced(false);
    router.push('/');
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex flex-col items-center text-center">
                <ShoppingCart className="w-16 h-16 mb-4 text-muted-foreground" />
                <h1 className="text-3xl font-bold font-headline mb-2">Your Cart is Empty</h1>
                <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
                <Button asChild>
                    <Link href="/">Continue Shopping</Link>
                </Button>
            </div>
      </div>
    );
  }

  return (
    <>
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold font-headline mb-8">Your Cart</h1>
      <div className="flex flex-col gap-8">
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-4 border-b pb-4">
              <div className="relative h-24 w-24 rounded-md overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-grow">
                <h2 className="font-semibold">{item.name}</h2>
              </div>
              <div className="flex items-center gap-4">
                 <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                    className="w-20 text-center"
                  />
                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                  <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleConfirmOrder} size="lg" disabled={isSubmitting || cart.length === 0} className="bg-primary hover:bg-primary/90">
             {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
            Confirm Order
          </Button>
        </div>
      </div>
    </div>
    <OrderConfirmationDialog
        isOpen={isConfirmationOpen}
        onClose={handleCloseConfirmation}
      />
    </>
  );
}
