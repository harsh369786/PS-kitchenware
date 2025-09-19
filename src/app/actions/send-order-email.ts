"use server";

import nodemailer from "nodemailer";
import { z } from "zod";

const OrderSchema = z.object({
  productName: z.string(),
  quantity: z.number().min(1),
  imageUrl: z.string(),
});

type OrderDetails = z.infer<typeof OrderSchema>;

export async function sendOrderEmail(details: OrderDetails) {
  const validation = OrderSchema.safeParse(details);

  if (!validation.success) {
    console.error("Invalid order details object:", details, validation.error.flatten());
    throw new Error("Invalid order details.");
  }

  const { productName, quantity } = validation.data;
  let { imageUrl } = validation.data;

  if (imageUrl.startsWith('/')) {
    const host = process.env.NEXT_PUBLIC_HOST_URL || 'http://localhost:9002';
    imageUrl = new URL(imageUrl, host).href;
  }
  
  const urlValidation = z.string().url().safeParse(imageUrl);
  if (!urlValidation.success) {
    console.error("Constructed imageUrl is not a valid URL:", imageUrl, urlValidation.error.flatten());
    throw new Error("Invalid image URL provided for the order.");
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
      subject: `New Order for ${productName}`,
      html: `
        <h1>New Order Received</h1>
        <p>An order has been placed for the following item:</p>
        <img src="${imageUrl}" alt="${productName}" width="200" />
        <h2>${productName}</h2>
        <p><strong>Quantity:</strong> ${quantity}</p>
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
