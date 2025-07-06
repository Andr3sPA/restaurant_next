"use client";

import ImageViewer from "@/components/menu-item/image-viewer-basic";
import PriceFormat from "@/components/menu-item/price-format-basic";
import StarRatingFractions from "@/components/menu-item/star-rating-fractions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "../ui/card";
import { MotionDiv } from "../motionDiv";

import { useEffect, useState } from "react";
import type { CartItem } from "../shoppingCart";
const DEFAULT_IMAGE_URL =
  "https://raw.githubusercontent.com/stackzero-labs/ui/refs/heads/main/public/placeholders/headphone-4.jpg";

interface MenuItemDetailsProps {
  id: string;
  imageUrl?: string;
  discount?: string | null;
  title?: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
  inStock?: boolean;
  stockCount?: number;
  hasShipping?: boolean;
  shippingText?: string;
  price?: number;
  prefix?: string;
}

function MenuItemDetails({
  id,
  description,
  discount,
  hasShipping,
  imageUrl = DEFAULT_IMAGE_URL,
  inStock,
  prefix,
  price,
  rating,
  reviewCount,
  shippingText,
  stockCount,
  title,
}: MenuItemDetailsProps) {
  const [cartItems, setCartItems] = useState<Array<CartItem>>([]);

  useEffect(() => {
    const existingItems = localStorage.getItem("cartItems");
    if (existingItems) {
      try {
        const parsedItems: unknown = JSON.parse(existingItems);
        if (Array.isArray(parsedItems)) {
          // Validar que cada item tenga la estructura correcta
          const validItems = parsedItems.filter(
            (item: unknown): item is CartItem => {
              return (
                typeof item === "object" &&
                item !== null &&
                "imageUrl" in item &&
                typeof (item as { imageUrl: unknown }).imageUrl === "string"
              );
            },
          );
          setCartItems(validItems);
        }
      } catch (error) {
        console.error("Error parsing cart items from localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const handleAddToCart = () => {
    const itemToSave = {
      id,
      description,
      imageUrl,
      prefix,
      price,
      title,
    };

    setCartItems((prevItems) => [...prevItems, itemToSave]);

    window.dispatchEvent(new Event("cartUpdated"));
  };
  return (
    <MotionDiv>
      <Card>
        <CardContent className="bg-card grid max-w-screen-lg grid-cols-4 gap-6 rounded-lg p-4">
          <div className="relative col-span-4 w-full md:col-span-2">
            {discount && (
              <div className="absolute top-2 left-2 z-10 w-fit rounded-lg bg-purple-500/80 p-2">
                <p className="text-xs font-semibold">{discount}</p>
              </div>
            )}
            <ImageViewer imageUrl={imageUrl} />
          </div>

          <div className="col-span-4 flex flex-col gap-6 md:col-span-2">
            <div className="flex flex-col gap-2">
              <p className="text-3xl font-semibold">{title}</p>
              {rating && (
                <div className="flex flex-row flex-wrap items-center gap-2">
                  <StarRatingFractions readOnly value={rating ?? 0} />
                  <p className="text-lg">({rating})</p>
                  <p className="text-muted-foreground">{reviewCount} reviews</p>
                </div>
              )}
              <p className="text-muted-foreground text-base">{description}</p>
            </div>

            <div className="flex flex-col gap-2">
              {inStock ? (
                <div className="flex flex-row items-center gap-2">
                  <div className="w-fit rounded-lg border border-green-500 bg-green-500/30 px-2 py-1 text-sm font-semibold text-green-500 uppercase dark:border-green-300 dark:text-green-300">
                    In Stock
                  </div>
                  {stockCount && (
                    <p className="text-muted-foreground">
                      +{stockCount} in stocks
                    </p>
                  )}
                </div>
              ) : (
                <div className="w-fit rounded-lg border border-red-500 bg-red-500/30 px-2 py-1 text-sm font-semibold text-red-500 uppercase dark:border-red-300 dark:text-red-300">
                  Out of Stock
                </div>
              )}

              {hasShipping && (
                <p>
                  <a
                    href="#"
                    className="semibold underline underline-offset-4 opacity-80 hover:opacity-100"
                  >
                    {shippingText}
                  </a>{" "}
                  on all orders
                </p>
              )}
            </div>

            <PriceFormat
              prefix={prefix}
              value={price ?? 0}
              className="text-4xl font-semibold"
            />

            <div className="flex flex-row flex-wrap gap-4">
              <Button
                variant="outline"
                size="lg"
                className="w-full md:w-fit"
                onClick={handleAddToCart}
              >
                Add to cart
              </Button>
              <Button size="lg" className="w-full md:w-fit">
                Order now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  );
}

export { MenuItemDetails };
export type { MenuItemDetailsProps };
