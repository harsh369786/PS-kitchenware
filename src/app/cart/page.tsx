import { ShoppingCart } from "lucide-react";

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col items-center text-center">
        <ShoppingCart className="w-16 h-16 mb-4 text-muted-foreground" />
        <h1 className="text-3xl font-bold font-headline mb-2">Your Cart is Empty</h1>
        <p className="text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
      </div>
    </div>
  );
}
