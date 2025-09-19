import AiProductForm from '@/components/ai-product-form';
import { Bot } from 'lucide-react';

export default function AIProductDescriptionPage() {
  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Bot className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
            AI Product Description Generator
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Provide product context or an image to generate compelling marketing descriptions.
          </p>
        </div>
        <AiProductForm />
      </div>
    </div>
  );
}
