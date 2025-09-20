"use server";

import nodemailer from "nodemailer";
import { z } from "zod";
import type { CartItem } from '@/lib/types';

const CartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().min(1),
  imageUrl: z.string(),
});

const OrderSchema = z.object({
  cartItems: z.array(CartItemSchema),
});

type OrderDetails = z.infer<typeof OrderSchema>;

function getHost() {
    return process.env.NEXT_PUBLIC_HOST_URL || 'http://localhost:9002';
}

function generateCartHTML(cartItems: CartItem[]) {
    const host = getHost();
    return cartItems.map(item => {
        // Ensure imageUrl is an absolute URL
        let absoluteImageUrl = item.imageUrl.startsWith('/') 
            ? new URL(item.imageUrl, host).href
            : item.imageUrl;

        return `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0; display: flex; align-items: center;">
                <img src="${absoluteImageUrl}" alt="${item.name}" width="80" style="margin-right: 20px; border-radius: 8px;" />
                <div>
                    <h3 style="margin: 0; font-size: 16px;">${item.name}</h3>
                    <p style="margin: 5px 0 0;"><strong>Quantity:</strong> ${item.quantity}</p>
                </div>
            </div>
        `;
    }).join('');
}


export async function sendOrderEmail(details: OrderDetails) {
  const validation = OrderSchema.safeParse(details);

  if (!validation.success) {
    console.error("Invalid order details object:", details, validation.error.flatten());
    throw new Error("Invalid order details.");
  }
  
  const { cartItems } = validation.data;
  
  if (cartItems.length === 0) {
      console.log("No items in cart, skipping email.");
      return { success: true, message: "No items to order." };
  }

  const { GMAIL_SENDER_EMAIL, GMAIL_APP_PASSWORD } = process.env;

  if (!GMAIL_SENDER_EMAIL || !GMAIL_APP_PASSWORD) {
    console.error("Missing Gmail environment variables for App Password.");
    throw new Error("Email service is not configured.");
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_SENDER_EMAIL,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"PS Essentials" <${GMAIL_SENDER_EMAIL}>`,
      to: "harsh.shah@finqy.ai",
      subject: `New Order Received`,
      html: `
        <h1>New Order Received</h1>
        <p>A new order has been placed with the following items:</p>
        <div style="border: 1px solid #ccc; border-radius: 8px; padding: 15px;">
            ${generateCartHTML(cartItems)}
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send order email.");
  }
}
