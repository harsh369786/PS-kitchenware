"use server";
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import type { Order } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const ordersFilePath = path.join(process.cwd(), "src/lib/orders.json");

const orderSchema = z.object({
  id: z.string(),
  productName: z.string(),
  quantity: z.number(),
  size: z.string().optional(),
  date: z.string().datetime(),
  imageUrl: z.string().url(),
});


async function readOrders(): Promise<Order[]> {
  try {
    const data = await fs.readFile(ordersFilePath, "utf-8");
    const orders: Order[] = JSON.parse(data);
    return orders.map(order => orderSchema.parse(order));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return []; // No orders yet, return empty array
    }
    console.error("Failed to read or parse orders file:", error);
    // Return empty array on error to prevent dashboard crash
    return [];
  }
}

async function writeOrders(orders: Order[]): Promise<void> {
  try {
    await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error("Failed to write orders file:", error);
    throw new Error("Could not save orders.");
  }
}

export async function getOrders(): Promise<Order[]> {
    return await readOrders();
}

export async function addOrder(newOrder: Omit<Order, 'id' | 'date'>): Promise<void> {
  const orders = await readOrders();
  const orderWithTimestamp: Order = {
    ...newOrder,
    id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    date: new Date().toISOString(),
  };

  const validatedOrder = orderSchema.parse(orderWithTimestamp);
  orders.push(validatedOrder);
  await writeOrders(orders);
  
  // Revalidate the dashboard path to trigger data refresh
  revalidatePath('/admin/dashboard');
}
