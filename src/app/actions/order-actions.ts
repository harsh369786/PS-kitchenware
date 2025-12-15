
"use server";
import { z } from "zod";
import type { Order } from '@/lib/types';
import { promises as fs } from 'fs';
import path from 'path';

const ordersFilePath = path.join(process.cwd(), 'src/lib/orders.json');

async function readOrdersFromFile(): Promise<Order[]> {
    try {
        const fileContent = await fs.readFile(ordersFilePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return []; // File doesn't exist, return empty array
        }
        console.error("Failed to read orders from file:", error);
        return [];
    }
}

async function writeOrdersToFile(orders: Order[]): Promise<void> {
    try {
        await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2));
    } catch (error) {
        console.error("Failed to write orders to file:", error);
        throw new Error("Could not save orders.");
    }
}

export async function getOrders(): Promise<Order[]> {
    const orders = await readOrdersFromFile();
    // Sort orders by date descending
    return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addOrder(newOrderData: Omit<Order, 'id' | 'date'>): Promise<void> {
    const existingOrders = await readOrdersFromFile();
    
    const newOrder: Order = {
        ...newOrderData,
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: new Date().toISOString(),
    };

    const updatedOrders = [...existingOrders, newOrder];
    await writeOrdersToFile(updatedOrders);
    console.log("Order successfully added and saved to orders.json");
}
