"use server";

import { z } from "zod";
import type { CartItem } from '@/lib/types';

const CartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().min(1),
  imageUrl: z.string().url(), // Expect a full URL
  size: z.string().optional(),
  price: z.number(),
});

const AddressSchema = z.object({
  name: z.string(),
  phone: z.string(),
  address: z.string(),
  pincode: z.string(),
  email: z.string().email(),
});

const OrderSchema = z.object({
  cartItems: z.array(CartItemSchema),
  address: AddressSchema,
});

type OrderDetails = z.infer<typeof OrderSchema>;

export async function sendOrderEmail(details: OrderDetails) {
  // This function is now a placeholder.
  // Email sending logic has been removed to reduce bundle size.
  // You can re-integrate an email service here if needed (e.g., using a transactional email API).
  console.log("Order details for email (not sent):", details);
  return { success: true, message: "Order processed." };
}
