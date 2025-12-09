
"use server";
import { z } from "zod";
import type { Order } from '@/lib/types';
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';

const orderSchema = z.object({
  id: z.string(),
  productName: z.string(),
  quantity: z.number(),
  size: z.string().optional(),
  price: z.number().optional(),
  date: z.string().datetime(),
  imageUrl: z.string().url(),
});

function extractValue(body: string, label: string): string {
    const regex = new RegExp(`<strong>${label}:<\\/strong>\\s*([^<]+)`);
    const match = body.match(regex);
    return match ? match[1].trim() : '';
}

function parseEmailBody(html: string): Omit<Order, 'id' | 'date'>[] {
    const products: Omit<Order, 'id' | 'date'>[] = [];
    const productDivs = html.split('<div style="border-bottom: 1px solid #eee; padding: 10px 0; display: flex; align-items: center;">');
    
    productDivs.slice(1).forEach((div) => {
        const nameMatch = div.match(/<h3 style="margin: 0; font-size: 16px;">([^<]+)<\/h3>/);
        const quantityMatch = div.match(/<strong>Quantity:<\/strong>\s*(\d+)/);
        const priceMatch = div.match(/<strong>Price:<\/strong>\s*₹([\d.]+)/);
        const sizeMatch = div.match(/<strong>Size:<\/strong>\s*([^<]+)/);
        const imageMatch = div.match(/<img src="([^"]+)"/);

        if (nameMatch && quantityMatch && priceMatch && imageMatch) {
            products.push({
                productName: nameMatch[1],
                quantity: parseInt(quantityMatch[1], 10),
                price: parseFloat(priceMatch[1]),
                size: sizeMatch ? sizeMatch[1] : undefined,
                imageUrl: imageMatch[1],
            });
        }
    });

    return products;
}

export async function getOrders(): Promise<Order[]> {
    const { GMAIL_SENDER_EMAIL, GMAIL_APP_PASSWORD } = process.env;

    if (!GMAIL_SENDER_EMAIL || !GMAIL_APP_PASSWORD) {
        console.error("Missing Gmail IMAP environment variables.");
        // Return empty array if not configured, so the dashboard doesn't crash.
        return [];
    }
    
    const config = {
        imap: {
            user: GMAIL_SENDER_EMAIL,
            password: GMAIL_APP_PASSWORD,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false }
        }
    };

    let connection: imaps.ImapSimple | null = null;
    try {
        connection = await imaps.connect(config);
        await connection.openBox('INBOX');

        const searchCriteria = ['ALL', ['SUBJECT', 'New Order Received']];
        const fetchOptions = { bodies: ['HEADER.FIELDS (DATE)', 'TEXT'], struct: true };

        const messages = await connection.search(searchCriteria, fetchOptions);
        const orders: Order[] = [];

        for (const item of messages) {
            const all = item.parts.find(part => part.which === 'TEXT');
            if (all?.body) {
                const parsedMail = await simpleParser(all.body);
                const dateHeader = item.parts.find(part => part.which === 'HEADER.FIELDS (DATE)');
                const emailDate = dateHeader?.body ? new Date(dateHeader.body.date[0]) : new Date();
                
                if (typeof parsedMail.html === 'string') {
                    const productsFromEmail = parseEmailBody(parsedMail.html);
                    productsFromEmail.forEach((product, index) => {
                         orders.push({
                            ...product,
                            id: `order-${emailDate.getTime()}-${index}`,
                            date: emailDate.toISOString(),
                         });
                    });
                }
            }
        }
        
        // Sort orders by date descending
        return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    } catch (error) {
        console.error("Failed to fetch orders from Gmail:", error);
        return [];
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

// This function is kept for compatibility but no longer writes to a file.
// The primary order mechanism is via email.
export async function addOrder(newOrder: Omit<Order, 'id' | 'date'>): Promise<void> {
  console.log("Order received, processed via email notification:", newOrder.productName);
}
