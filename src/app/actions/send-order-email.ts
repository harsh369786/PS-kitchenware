"use server";

import nodemailer from "nodemailer";
import { z } from "zod";
import type { CartItem } from '@/lib/types';

const CartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().min(1),
  imageUrl: z.string(),
  size: z.string().optional(),
  price: z.number(),
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
    const itemsHTML = cartItems.map(item => {
        let absoluteImageUrl = item.imageUrl.startsWith('/') 
            ? new URL(item.imageUrl, host).href
            : item.imageUrl;

        return `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0; display: flex; align-items: center;">
                <img src="${absoluteImageUrl}" alt="${item.name}" width="80" style="margin-right: 20px; border-radius: 8px;" />
                <div style="flex-grow: 1;">
                    <h3 style="margin: 0; font-size: 16px;">${item.name}</h3>
                    ${item.size ? `<p style="margin: 5px 0 0;"><strong>Size:</strong> ${item.size}</p>` : ''}
                    <p style="margin: 5px 0 0;"><strong>Quantity:</strong> ${item.quantity}</p>
                    <p style="margin: 5px 0 0;"><strong>Price:</strong> ₹${item.price.toFixed(2)}</p>
                </div>
                <div style="font-weight: bold; text-align: right;">
                    ₹${(item.price * item.quantity).toFixed(2)}
                </div>
            </div>
        `;
    }).join('');

    return `
      <div style="border: 1px solid #ccc; border-radius: 8px; padding: 15px; max-width: 600px; margin: auto;">
          ${itemsHTML}
      </div>
    `;
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
  
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

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
      from: `"Ps Kitchenware" <${GMAIL_SENDER_EMAIL}>`,
      to: "harsh.shah@finqy.ai",
      subject: `New Order Received`,
      html: `
        <h1>New Order Received</h1>
        <p>A new order has been placed with the following items:</p>
        ${generateCartHTML(cartItems)}
        <div style="max-width: 600px; margin: auto; padding-top: 15px; margin-top: 15px; border-top: 2px solid #333; text-align: right;">
          <h2 style="margin: 0; font-size: 20px;">Total Price: ₹${totalPrice.toFixed(2)}</h2>
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
