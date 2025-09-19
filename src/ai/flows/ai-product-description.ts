'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating product descriptions using AI.
 *
 * - generateProductDescription - An async function that takes product information and generates a description.
 * - AIProductDescriptionInput - The expected input schema for product information.
 * - AIProductDescriptionOutput - The output schema containing the generated product description.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIProductDescriptionInputSchema = z.object({
  productImage: z
    .string()
    .optional()
    .describe(
      "A product image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productContext: z
    .string()
    .optional()
    .describe('Any context or draft description of the product.'),
});
export type AIProductDescriptionInput = z.infer<
  typeof AIProductDescriptionInputSchema
>;

const AIProductDescriptionOutputSchema = z.object({
  productDescription: z
    .string()
    .describe('The AI-generated product description.'),
});
export type AIProductDescriptionOutput = z.infer<
  typeof AIProductDescriptionOutputSchema
>;

export async function generateProductDescription(
  input: AIProductDescriptionInput
): Promise<AIProductDescriptionOutput> {
  return aiProductDescriptionFlow(input);
}

const aiProductDescriptionPrompt = ai.definePrompt({
  name: 'aiProductDescriptionPrompt',
  input: { schema: AIProductDescriptionInputSchema },
  output: { schema: AIProductDescriptionOutputSchema },
  prompt: `You are an AI assistant designed to generate compelling product descriptions for e-commerce websites.

  Instructions:
  1.  If productContext is provided, refine it to improve the tone, style, and marketing effectiveness. Offer variations in style.
  2.  If only productImage is provided (or if productContext is missing), analyze the image and propose relevant product features and context.
  3.  The output should be a well-written product description that would entice customers to purchase the product.

  Product Context: {{{productContext}}}
  Product Image: {{#if productImage}}{{media url=productImage}}{{else}}No image provided.{{/if}}
  `,
});

const aiProductDescriptionFlow = ai.defineFlow(
  {
    name: 'aiProductDescriptionFlow',
    inputSchema: AIProductDescriptionInputSchema,
    outputSchema: AIProductDescriptionOutputSchema,
  },
  async input => {
    const { output } = await aiProductDescriptionPrompt(input);
    return output!;
  }
);
