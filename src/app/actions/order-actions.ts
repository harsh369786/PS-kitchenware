"use server";
import { z } from "zod";
import type { Order } from '@/lib/types';
import { supabase } from '@/lib/supabase';

export async function getOrders(): Promise<Order[]> {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error("Supabase error fetching orders:", error);
            return [];
        }

        if (!data) return [];

        return data.map((item: any) => ({
            id: item.id,
            productName: item.product_name,
            quantity: item.quantity,
            date: item.date,
            imageUrl: item.image_url,
            size: item.size,
            price: item.price
        }));
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return [];
    }
}

export async function addOrder(newOrderData: Omit<Order, 'id' | 'date'>): Promise<void> {
    try {
        const id = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const date = new Date().toISOString();

        const { error } = await supabase
            .from('orders')
            .insert({
                id: id,
                product_name: newOrderData.productName,
                quantity: newOrderData.quantity,
                price: newOrderData.price,
                size: newOrderData.size,
                image_url: newOrderData.imageUrl,
                date: date
            });

        if (error) throw error;
        console.log("Order successfully added to Supabase");
    } catch (error) {
        console.error("Failed to add order to Supabase:", error);
        throw new Error("Could not save order.");
    }
}
