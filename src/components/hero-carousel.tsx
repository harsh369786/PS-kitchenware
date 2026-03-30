
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

interface HeroCarouselProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export default function HeroCarousel({ products, onProductClick }: HeroCarouselProps) {
  if (!products || products.length === 0) {
    return null;
  }
  
  return (
    <section className="w-full mb-12 md:mb-20" aria-label="Featured Products">
      <Carousel
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
        opts={{ loop: true }}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {products.map((product, index) => (
            <CarouselItem key={product.id} className="pl-0">
              <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] w-full">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'low'}
                  className="object-cover"
                  sizes="100vw"
                  quality={index === 0 ? 85 : 75}
                  data-ai-hint={product.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 sm:p-8 md:p-16 text-white">
                  <div className="max-w-md">
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-headline">{product.name}</h2>
                    {product.tagline && <p className="mt-2 md:mt-4 text-sm sm:text-base md:text-lg">{product.tagline}</p>}
                    <Button
                      onClick={() => onProductClick(product)}
                      className="mt-3 md:mt-6"
                      size="lg"
                    >
                      Shop Now
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-black/50 border-none h-8 w-8 sm:h-10 sm:w-10" />
        <CarouselNext className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-black/50 border-none h-8 w-8 sm:h-10 sm:w-10" />
      </Carousel>
    </section>
  );
}
