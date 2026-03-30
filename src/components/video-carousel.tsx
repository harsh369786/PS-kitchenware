"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { VideoCarouselItem } from "@/lib/types";

interface VideoCarouselProps {
  videos: VideoCarouselItem[];
}

export default function VideoCarousel({ videos }: VideoCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);

  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setActiveIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("select", () => onSelect(api));
  }, [api, onSelect]);

  const handleVideoEnded = () => {
    if (api) {
      api.scrollNext();
    }
  };

  if (!videos || videos.length === 0) return null;

  return (
    <section className="w-full py-12 md:py-24 bg-muted/10 border-y border-border" aria-label="Brand Stories">
      <div className="container px-4 md:px-6 mx-auto">
         <div className="flex flex-col items-center mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">Brand Stories</h2>
            <p className="mt-4 text-muted-foreground md:text-lg">Experience our craftsmanship in motion</p>
        </div>
        <Carousel 
            setApi={setApi} 
            opts={{ loop: true }}
            className="w-full max-w-lg mx-auto"
        >
          <CarouselContent className="-ml-0">
            {videos.map((video, index) => (
              <CarouselItem key={video.id} className="pl-0">
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
                  <video
                    src={video.videoUrl}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    onEnded={handleVideoEnded}
                    ref={(el) => {
                      if (el) {
                        if (index === activeIndex) {
                          el.play().catch((err) => {
                              console.warn("Autoplay blocked or video error:", err);
                          });
                        } else {
                          el.pause();
                          el.currentTime = 0;
                        }
                      }
                    }}
                  />
                  {(video.title || video.description) && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white">
                      {video.title && <h3 className="text-xl md:text-3xl font-bold">{video.title}</h3>}
                      {video.description && <p className="mt-2 text-sm md:text-lg text-gray-200 max-w-2xl">{video.description}</p>}
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
