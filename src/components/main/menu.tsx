"use client";

import { api } from "@/trpc/react";
import { skipToken } from "@tanstack/react-query";
import { Card, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MenuItemDetails } from "@/components/menu-item/menu-item-details";
//
// Componente para mostrar la lista de productos del menú y permitir añadirlos al carrito
export default function Menu() {
  const { addItem } = useCart();
  const [openId, setOpenId] = React.useState<string | null>(null);

  const {
    data: menuItems = [],
    isLoading,
    error,
  } = api.menu.getPublicMenuItems.useQuery();
  const { data: itemDetails, isLoading: isDetailsLoading } =
    api.menu.getMenuItemDetails.useQuery(openId ?? skipToken, {
      enabled: !!openId,
    });

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="grid grid-cols-1 gap-6 pb-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {menuItems.map((item) => (
        <Dialog
          key={item.id}
          open={openId === item.id}
          onOpenChange={(open) => setOpenId(open ? item.id : null)}
        >
          <DialogTrigger asChild>
            <Card
              className="flex h-auto min-h-[260px] w-full max-w-sm flex-col gap-2 sm:h-[240px] lg:h-[260px]"
              onClick={() => setOpenId(item.id)}
            >
              <CardHeader className="flex flex-col items-center">
                <CardTitle>{item.name}</CardTitle>
                <div className="flex h-[130px] w-[130px] items-center justify-center">
                  <Image
                    src={item.image ?? "/favicon.ico"}
                    width={130}
                    height={130}
                    alt={item.description ?? item.name}
                    className="h-full w-full rounded-md object-cover"
                  />
                </div>
              </CardHeader>
              <div />
              <CardFooter className="mt-auto">
                <Button
                  className="w-full"
                  disabled={!item.available}
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem({
                      id: item.id,
                      title: item.name,
                      description: item.description ?? undefined,
                      imageUrl: item.image ?? "",
                      prefix: item.currency,
                      price: item.price,
                    });
                  }}
                >
                  <ShoppingCart />
                  {item.available ? "Añadir al carrito" : "No disponible"}
                </Button>
              </CardFooter>
            </Card>
          </DialogTrigger>
          <DialogContent className="flex max-h-[80vh] w-full max-w-3xl flex-col items-center justify-center overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Descripcion del plato
              </DialogTitle>
            </DialogHeader>
            <div className="flex h-full w-[500px] max-w-full items-center justify-center sm:w-[600px] md:w-[700px] lg:w-[800px] xl:w-[900px]">
              {isDetailsLoading ? (
                <div className="w-full py-10 text-center">Cargando...</div>
              ) : itemDetails ? (
                <div className="break-words whitespace-normal">
                  <MenuItemDetails
                    id={itemDetails.id}
                    title={itemDetails.name}
                    description={itemDetails.description ?? "No description"}
                    prefix={itemDetails.currency}
                    price={itemDetails.price}
                    inStock={itemDetails.available}
                    imageUrl={itemDetails.image ?? undefined}
                  />
                </div>
              ) : (
                <div className="w-full py-10 text-center">
                  No se encontró el producto.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
