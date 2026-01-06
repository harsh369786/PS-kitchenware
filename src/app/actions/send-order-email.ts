"use server";

import nodemailer from 'nodemailer';
import { z } from "zod";
import type { CartItem } from '@/lib/types';

const CartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().min(1),
  imageUrl: z.string().url(),
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

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_SENDER_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, ''), // Remove any spaces from app password
  },
});

function generateOrderEmailHTML(details: OrderDetails): string {
  const { cartItems, address } = details;
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .content { padding: 30px 20px; }
    .section-title { color: #667eea; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
    .order-item { background: #f9fafb; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; display: flex; gap: 15px; align-items: center; }
    .product-image { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
    .product-details { flex: 1; }
    .item-row { display: flex; justify-content: space-between; margin: 5px 0; }
    .item-name { font-weight: bold; color: #333; font-size: 16px; }
    .item-detail { color: #666; font-size: 14px; }
    .total-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: right; margin-top: 20px; }
    .total-label { font-size: 16px; opacity: 0.9; }
    .total-amount { font-size: 28px; font-weight: bold; margin-top: 5px; }
    .address-section { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
    .address-label { font-weight: bold; color: #667eea; margin-bottom: 10px; }
    .address-detail { margin: 5px 0; color: #333; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
    .footer-logo { color: #667eea; font-weight: bold; font-size: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Order Confirmed!</h1>
      <p>Thank you for shopping with PS Kitchenware</p>
    </div>
    
    <div class="content">
      <div class="section-title">📦 Order Details</div>
      ${cartItems.map(item => `
        <div class="order-item">
          <img src="${item.imageUrl}" alt="${item.name}" class="product-image" />
          <div class="product-details">
            <div class="item-row">
              <span class="item-name">${item.name}</span>
              <span class="item-name">₹${item.price.toFixed(2)}</span>
            </div>
            ${item.size ? `<div class="item-row"><span class="item-detail">Size: ${item.size}</span></div>` : ''}
            <div class="item-row">
              <span class="item-detail">Quantity: ${item.quantity}</span>
              <span class="item-detail">Subtotal: ₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          </div>
        </div>
      `).join('')}
      
      <div class="address-section">
        <div class="address-label">🚚 Shipping Address</div>
        <div class="address-detail"><strong>${address.name}</strong></div>
        <div class="address-detail">${address.address}</div>
        <div class="address-detail">${address.pincode}</div>
        <div class="address-detail">📞 ${address.phone}</div>
        <div class="address-detail">✉️ ${address.email}</div>
      </div>
      
      <div class="total-section">
        <div class="total-label">Order Total</div>
        <div class="total-amount">₹${total.toFixed(2)}</div>
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-logo">PS KITCHENWARE</div>
      <p>Quality kitchenware for your home</p>
      <p style="margin-top: 15px;">This is an automated email. Please do not reply.</p>
      <p>© ${new Date().getFullYear()} PS Kitchenware. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendOrderEmail(details: OrderDetails) {
  try {
    // Validate input
    const validated = OrderSchema.parse(details);
    const total = validated.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Send email to customer
    await transporter.sendMail({
      from: `"PS Kitchenware" <${process.env.GMAIL_SENDER_EMAIL}>`,
      to: validated.address.email,
      subject: `Order Confirmation - PS Kitchenware`,
      html: generateOrderEmailHTML(validated),
    });

    // Send notification to business owner (shahharsh143.hs@gmail.com)
    await transporter.sendMail({
      from: `"PS Kitchenware Orders" <${process.env.GMAIL_SENDER_EMAIL}>`,
      to: 'shahharsh143.hs@gmail.com',
      subject: `🛒 New Order from ${validated.address.name} - ₹${total.toFixed(2)}`,
      html: generateOrderEmailHTML(validated),
    });

    console.log('Order emails sent successfully to:', validated.address.email, 'and shahharsh143.hs@gmail.com');
    return { success: true, message: 'Order placed and confirmation email sent!' };

  } catch (error) {
    console.error('Failed to send order email:', error);
    // Don't throw error - order should still be saved even if email fails
    return {
      success: false,
      message: 'Order placed successfully, but email notification failed. We will contact you soon.'
    };
  }
}
