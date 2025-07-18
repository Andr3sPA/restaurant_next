"use client";

import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function Menu() {
  const { addItem } = useCart();

  const {
    data: menuItems = [],
    isLoading,
    error,
  } = api.menu.getPublicMenuItems.useQuery();

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="grid grid-cols-1 gap-6 pb-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {menuItems.map((item) => (
        <Card key={item.id} className="w-full max-w-sm gap-2">
          <CardHeader className="flex flex-col items-center">
            <CardTitle>{item.name}</CardTitle>
            <Image
              src={item.image ?? "/favicon.ico"}
              width={100}
              height={100}
              alt={item.description ?? item.name}
              className="rounded-md object-cover"
            ></Image>
          </CardHeader>
          <CardContent className="flex-grow text-sm sm:text-base">
            <p>{item.description}</p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              disabled={!item.available}
              onClick={() =>
                addItem({
                  id: item.id,
                  title: item.name,
                  description: item.description ?? undefined,
                  imageUrl: item.image ?? "",
                  prefix: item.currency,
                  price: item.price,
                })
              }
            >
              <ShoppingCart />
              {item.available ? "Añadir al carrito" : "No disponible"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
