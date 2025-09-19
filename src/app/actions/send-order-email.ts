"use server";

import nodemailer from "nodemailer";
import { z } from "zod";

const OrderSchema = z.object({
  productName: z.string(),
  quantity: z.number().min(1),
  imageUrl: z.string(), // Allow any string for now
});

type OrderDetails = z.infer<typeof OrderSchema>;

export async function sendOrderEmail(details: OrderDetails) {
  const validation = OrderSchema.safeParse(details);

  if (!validation.success) {
    // Basic logging for debugging
    console.error("Invalid order details object:", details, validation.error.flatten());
    throw new Error("Invalid order details.");
  }

  const { productName, quantity } = validation.data;
  let { imageUrl } = validation.data;

  // Construct absolute URL if it's a local path
  if (imageUrl.startsWith('/')) {
    const host = process.env.NEXT_PUBLIC_HOST_URL || 'http://localhost:9002';
    imageUrl = new URL(imageUrl, host).href;
  }
  
  // Now, validate if it's a URL.
  const urlValidation = z.string().url().safeParse(imageUrl);
  if (!urlValidation.success) {
    console.error("Constructed imageUrl is not a valid URL:", imageUrl, urlValidation.error.flatten());
    throw new Error("Invalid image URL provided for the order.");
  }


  // IMPORTANT: Storing credentials directly in code is a major security risk.
  // In a real production application, use environment variables and a secure vault.
  // This is implemented as per the user's specific request.
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "psessentials11@gmail.com",
      pass: "psessentials2710",
    },
  });

  const mailOptions = {
    from: '"PS Essentials" <psessentials11@gmail.com>',
    to: "harsh.shah@finqy.ai",
    subject: `New Order for ${productName}`,
    html: `
      <h1>New Order Received</h1>
      <p>An order has been placed for the following item:</p>
      <img src="${imageUrl}" alt="${productName}" width="200" />
      <h2>${productName}</h2>
      <p><strong>Quantity:</strong> ${quantity}</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send order email.");
  }
}
