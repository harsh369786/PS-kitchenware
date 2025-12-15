'use server';

import { z } from 'zod';

const EnquirySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  query: z.string().min(1, 'Query is required'),
});

type EnquiryDetails = z.infer<typeof EnquirySchema>;

export async function sendEnquiryEmail(details: EnquiryDetails) {
  // This function is now a placeholder.
  // Email sending logic has been removed to reduce bundle size.
  // You can re-integrate an email service here if needed (e.g., using a transactional email API).
  console.log("Enquiry details for email (not sent):", details);
  return { success: true, message: "Enquiry received." };
}
