"use client";

// Componente que muestra los detalles de un elemento del menú, incluyendo imagen, precio, stock y acciones.
import ImageViewer from "@/components/menu-item/image-viewer-basic";
import PriceFormat from "@/components/menu-item/price-format-basic";
import StarRatingFractions from "@/components/menu-item/star-rating-fractions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "../ui/card";
import { MotionDiv } from "../motionDiv";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
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
  const { addItem } = useCart();
  const router = useRouter();

  // Agrega el producto al carrito
  const handleAddToCart = () => {
    if (!price || !prefix || !title) {
      // Si faltan datos requeridos, no se agrega
      return;
    }

    const itemToAdd = {
      id,
      title,
      description: description ?? "No description",
      imageUrl: imageUrl ?? DEFAULT_IMAGE_URL,
      prefix,
      price,
    };

    addItem(itemToAdd);
  };

  // Agrega el producto al carrito y redirige a checkout
  const handleOrderNow = () => {
    if (!price || !prefix || !title) {
      return;
    }

    const itemToAdd = {
      id,
      title,
      description: description ?? "No description",
      imageUrl: imageUrl ?? DEFAULT_IMAGE_URL,
      prefix,
      price,
    };

    addItem(itemToAdd);
    router.push("/checkout");
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
                    En stock
                  </div>
                  {stockCount && (
                    <p className="text-muted-foreground">
                      +{stockCount} disponibles
                    </p>
                  )}
                </div>
              ) : (
                <div className="w-fit rounded-lg border border-red-500 bg-red-500/30 px-2 py-1 text-sm font-semibold text-red-500 uppercase dark:border-red-300 dark:text-red-300">
                  Sin stock
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
                  en todos los pedidos
                </p>
              )}
            </div>

            <PriceFormat
              prefix={prefix}
              value={price ?? 0}
              className="text-3xl font-semibold"
            />

            <div className="flex flex-row flex-wrap gap-4">
              <Button
                variant="outline"
                size="lg"
                className="w-full md:w-fit"
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                Agregar al carrito
              </Button>
              <Button
                size="lg"
                className="w-full md:w-fit"
                onClick={handleOrderNow}
                disabled={!inStock}
              >
                Ordenar ahora
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
