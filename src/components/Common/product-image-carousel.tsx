"use client";

import type { StoredFile } from "~/types/store";
import type { UseEmblaCarouselType } from "embla-carousel-react";

import type { HTMLAttributes, KeyboardEvent } from "react";
import { useCallback, useEffect, useState } from "react";

import Image from "next/image";

import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import useEmblaCarousel from "embla-carousel-react";
import { ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "~/components/ui/button";
import { cn } from "~/utils/cn";

type CarouselApi = UseEmblaCarouselType["1"];

type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;

type CarouselOptions = UseCarouselParameters["0"];

type ProductImageCarouselProps = {
  images: StoredFile[];
  options?: CarouselOptions;
} & HTMLAttributes<HTMLDivElement>;

export function ProductImageCarousel({
  className,
  images,
  options,
  ...props
}: ProductImageCarouselProps) {
  const t = useTranslations();

  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const [previousButtonDisabled, setPreviousButtonDisabled] = useState(true);
  const [nextButtonDisabled, setNextButtonDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrevious = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);

  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "ArrowLeft") {
        scrollPrevious();
      } else if (event.key === "ArrowRight") {
        scrollNext();
      }
    },
    [scrollNext, scrollPrevious],
  );

  const onSelect = useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) {
      return;
    }

    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPreviousButtonDisabled(!emblaApi.canScrollPrev());
    setNextButtonDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  if (images.length === 0) {
    return (
      <div
        className={`
          flex aspect-square size-full flex-1 items-center justify-center
          bg-secondary
        `}
        aria-label="Product Placeholder"
        aria-roledescription="placeholder"
        role="img"
      >
        <ImageIcon
          className="size-9 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      aria-label="Product image carousel"
      {...props}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div
          className="-ml-4 flex touch-pan-y"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square min-w-0 flex-[0_0_100%] pl-4"
            >
              <Image
                key={index}
                className="object-cover"
                alt={image.name}
                aria-label={`Slide ${index + 1} of ${images.length}`}
                aria-roledescription="slide"
                priority={index === 0}
                role="group"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={image.url}
                fill
              />
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 ? (
        <div className="flex w-full items-center justify-center gap-2">
          <Button
            className={`
              mr-0.5 aspect-square size-7 rounded-none

              sm:mr-2 sm:size-8
            `}
            disabled={previousButtonDisabled}
            size="icon"
            variant="outline"
            onClick={scrollPrevious}
          >
            <ChevronLeftIcon
              className={`
                size-3

                sm:size-4
              `}
              aria-hidden="true"
            />
            <span className="sr-only">
              {t("product-image-carousel.previousSlide")}
            </span>
          </Button>
          {images.map((image, index) => (
            <Button
              key={index}
              className={cn(
                `
                  group relative aspect-square size-full max-w-[100px]
                  rounded-none shadow-sm

                  focus-visible:ring-foreground

                  hover:bg-transparent
                `,
                index === selectedIndex && "ring-1 ring-foreground",
              )}
              size="icon"
              variant="outline"
              onClick={() => scrollTo(index)}
              onKeyDown={handleKeyDown}
            >
              <div
                className={`
                  absolute inset-0 z-10 bg-zinc-950/20

                  group-hover:bg-zinc-950/40
                `}
              />
              <Image
                alt={image.name}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={image.url}
                fill
              />
              <span className="sr-only">
                Slide {index + 1} of {images.length}
              </span>
            </Button>
          ))}
          <Button
            className={`
              ml-0.5 aspect-square size-7 rounded-none

              sm:ml-2 sm:size-8
            `}
            disabled={nextButtonDisabled}
            size="icon"
            variant="outline"
            onClick={scrollNext}
          >
            <ChevronRightIcon
              className={`
                size-3

                sm:size-4
              `}
              aria-hidden="true"
            />
            <span className="sr-only">
              {t("product-image-carousel.nextSlide")}
            </span>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
