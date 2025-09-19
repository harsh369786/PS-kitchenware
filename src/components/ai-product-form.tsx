'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateProductDescription } from '@/ai/flows/ai-product-description';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';

const formSchema = z.object({
  productContext: z.string().optional(),
  productImage: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AiProductForm() {
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedDescription('');

    try {
      let productImageBase64: string | undefined = undefined;
      if (values.productImage && values.productImage[0]) {
        productImageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(values.productImage[0]);
        });
      }

      const result = await generateProductDescription({
        productContext: values.productContext,
        productImage: productImageBase64,
      });

      setGeneratedDescription(result.productDescription);
    } catch (err) {
      setError('Failed to generate description. Please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="productContext"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Context or Draft</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'High-quality stainless steel spatula, perfect for flipping pancakes...'"
                        className="resize-none"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Image (optional)</FormLabel>
                    <FormControl>
                      <Input type="file" accept="image/*" {...form.register('productImage')} onChange={handleFileChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {imagePreview && (
                <div className="relative w-full h-48 border rounded-md overflow-hidden">
                    <Image src={imagePreview} alt="Product preview" fill className="object-contain" />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Description
            </Button>
          </CardFooter>
        </form>
      </Form>

      {(isGenerating || generatedDescription || error) && (
        <div className="border-t">
          <CardHeader>
            <CardTitle>Generated Description</CardTitle>
          </CardHeader>
          <CardContent>
            {isGenerating && (
                <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
                </div>
            )}
            {error && <p className="text-destructive">{error}</p>}
            {generatedDescription && (
              <p className="whitespace-pre-wrap">{generatedDescription}</p>
            )}
          </CardContent>
        </div>
      )}
    </Card>
  );
}
