
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, ShoppingCart } from "lucide-react";
import { sendOrderEmail } from "@/app/actions/send-order-email";
import { addOrder } from "@/app/actions/order-actions";
import OrderConfirmationDialog from "@/components/order-confirmation-dialog";
import AddressDialog from "@/components/address-dialog";
import { Separator } from "@/components/ui/separator";
import type { Address } from "@/lib/types";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  const [isAddressModalOpen, setAddressModalOpen] = useState(false);
  const router = useRouter();

  const handleQuantityChange = (cartItemId: string, quantity: number) => {
    if (quantity >= 1) {
      updateQuantity(cartItemId, quantity);
    }
  };

  const totalPrice = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const handleConfirmOrderClick = () => {
    setAddressModalOpen(true);
  };
  
  const handleAddressSubmit = async (address: Address) => {
    setAddressModalOpen(false);
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
            imageUrl: absoluteImageUrl,
            size: item.size,
            price: item.price,
        });
      }
      
      await sendOrderEmail({ cartItems: cart, address });
      
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
    clearCart();
    router.push('/');
  };

  if (cart.length === 0 && !isConfirmationOpen) {
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-4 border rounded-lg p-4">
              <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="flex-grow grid grid-cols-2 md:grid-cols-4 items-center gap-4">
                <div className="md:col-span-1">
                    <h2 className="font-semibold">{item.name}</h2>
                    {item.size && (
                        <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                    )}
                </div>
                 <div className="text-sm">₹{item.price.toFixed(2)}</div>
                <div className="flex items-center gap-2">
                   <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                    className="w-20 text-center"
                  />
                </div>
                 <div className="font-semibold text-right">₹{(item.price * item.quantity).toFixed(2)}</div>
              </div>
               <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="ml-4">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-muted-foreground">Calculated at next step</span>
                </div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{totalPrice.toFixed(2)}</span>
            </div>
             <p className="text-xs text-muted-foreground mt-2">
                Shipping charges will vary depending on the delivery location.
            </p>
            <Button onClick={handleConfirmOrderClick} size="lg" disabled={isSubmitting || cart.length === 0} className="w-full mt-6 bg-primary hover:bg-primary/90">
             {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm Order
            </Button>
          </div>
        </div>

      </div>
    </div>
    <AddressDialog
      isOpen={isAddressModalOpen}
      onClose={() => setAddressModalOpen(false)}
      onSubmit={handleAddressSubmit}
      isSubmitting={isSubmitting}
    />
    <OrderConfirmationDialog
        isOpen={isConfirmationOpen}
        onClose={handleCloseConfirmation}
      />
    </>
  );
}
