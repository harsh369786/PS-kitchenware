'use server';

import nodemailer from 'nodemailer';
import { z } from 'zod';

const EnquirySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  query: z.string().min(1, 'Query is required'),
});

type EnquiryDetails = z.infer<typeof EnquirySchema>;

export async function sendEnquiryEmail(details: EnquiryDetails) {
  const validation = EnquirySchema.safeParse(details);

  if (!validation.success) {
    console.error(
      'Invalid enquiry details object:',
      details,
      validation.error.flatten()
    );
    throw new Error('Invalid enquiry details.');
  }

  const { name, phone, query } = validation.data;

  const { GMAIL_SENDER_EMAIL, GMAIL_APP_PASSWORD } = process.env;

  if (!GMAIL_SENDER_EMAIL || !GMAIL_APP_PASSWORD) {
    console.error('Missing Gmail environment variables for App Password.');
    throw new Error('Email service is not configured.');
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_SENDER_EMAIL,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Ps Kitchenware" <${GMAIL_SENDER_EMAIL}>`,
      to: 'shahharsh143.hs@gmail.com',
      subject: `Enquiry Form`,
      html: `
        <h1>New Enquiry Received</h1>
        <p>A new enquiry has been submitted through the contact form:</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Query:</strong></p>
        <p>${query}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send enquiry email.');
  }
}
