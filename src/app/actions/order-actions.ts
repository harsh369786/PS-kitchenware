
"use server";
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import type { Order } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const ordersFilePath = path.join(process.cwd(), "public/uploads/orders.json");

const orderSchema = z.object({
  id: z.string(),
  productName: z.string(),
  quantity: z.number(),
  size: z.string().optional(),
  price: z.number().optional(),
  date: z.string().datetime(),
  imageUrl: z.string().url(),
});


async function readOrders(): Promise<Order[]> {
  // In a read-only filesystem environment, we might not be able to write,
  // but we should still try to read existing orders if the file is present from the build.
  try {
    const data = await fs.readFile(ordersFilePath, "utf-8");
    if (!data) return [];
    const orders: Order[] = JSON.parse(data);
    return orders.map(order => orderSchema.parse(order));
  } catch (error) {
    // If the file doesn't exist or there's an error, return an empty array.
    // This is expected in environments where the file isn't created.
    return [];
  }
}


export async function getOrders(): Promise<Order[]> {
    return await readOrders();
}

export async function addOrder(newOrder: Omit<Order, 'id' | 'date'>): Promise<void> {
  // This function is being kept for API compatibility, but we are no longer
  // writing to a file on the server because the deployed environment has a
  // read-only filesystem. The core ordering functionality relies on email notifications.
  
  // We can still revalidate the path in case the data source changes in the future.
  revalidatePath('/admin/dashboard');
  
  // We will simply log the action for now.
  console.log("Order received, but not saved to file system:", newOrder.productName);

  // No file writing operation is performed.
}
