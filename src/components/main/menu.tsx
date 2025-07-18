"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Componente para mostrar la lista de productos del menú y permitir añadirlos al carrito
export default function Menu() {
  const router = useRouter();

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
        <Card
          key={item.id}
          className="w-full max-w-sm gap-2 transition-all duration-200 ease-out hover:cursor-pointer hover:brightness-110"
          onClick={() => router.push(`/menu/${item.id}`)}
        >
          <CardHeader className="flex flex-col items-center">
            <CardTitle>{item.name}</CardTitle>
            <Image
              src={item.image ?? "/favicon.ico"}
              width={100}
              height={100}
              alt={item.description ?? item.name}
              className="rounded-md object-fill"
            />
          </CardHeader>
          <CardContent className="flex-grow text-sm sm:text-base">
            <p>{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
