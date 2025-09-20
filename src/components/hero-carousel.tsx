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
  return (
    <section className="w-full">
      <Carousel
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
        opts={{ loop: true }}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {products.map((product) => (
            <CarouselItem key={product.id} className="pl-0">
              <div className="relative h-[400px] md:h-[600px] w-full">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  priority={products.indexOf(product) === 0}
                  className="object-cover"
                  data-ai-hint={product.imageHint}
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-0 left-0 p-8 md:p-16 text-white">
                  <div className="max-w-md">
                    <h2 className="text-3xl md:text-5xl font-bold font-headline">{product.name}</h2>
                    {product.tagline && <p className="mt-2 md:mt-4 text-lg">{product.tagline}</p>}
                    <Button
                      onClick={() => onProductClick(product)}
                      className="mt-4 md:mt-6"
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
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-black/50 border-none" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-black/50 border-none" />
      </Carousel>
    </section>
  );
}
