"use client";

import { api } from "@/trpc/react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import { Card, CardFooter, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import { ShoppingCart, Text } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import * as React from "react";
import Link from "next/link";
import type { Column, ColumnDef } from "@tanstack/react-table";
import { parseAsString, useQueryState } from "nuqs";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  available: boolean;
  image: string | null;
}

// Hook para detectar el tamaño de la pantalla
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
};

// Componente para renderizar una card individual
function MenuItemCard({ item }: { item: MenuItem }) {
  const { addItem } = useCart();

  return (
    <Link href={`/menu/${item.id}`}>
      <Card className="flex h-auto min-h-[320px] w-full max-w-sm cursor-pointer flex-col gap-2 transition-shadow hover:shadow-lg">
        <CardHeader className="flex flex-col items-center space-y-4">
          <CardTitle className="text-center text-base font-semibold [word-break:break-word]">
            {item.name}
          </CardTitle>
          <div className="flex h-[150px] w-[150px] items-center justify-center">
            <Image
              src={item.image ?? "/favicon.ico"}
              width={150}
              height={150}
              alt={item.description ?? item.name}
              className="h-full w-full rounded-md object-cover"
            />
          </div>
          {/* Mostrar precio */}
          <div className="text-center">
            <span className="text-primary text-lg font-bold">
              {item.currency}
              {item.price.toFixed(2)}
            </span>
          </div>
        </CardHeader>
        <CardFooter className="mt-auto">
          <Button
            className="w-full text-xs"
            size="sm"
            disabled={!item.available}
            onClick={(e) => {
              e.preventDefault(); // Evitar navegación
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
            <ShoppingCart className="h-3 w-3" />
            {item.available ? "Añadir" : "No disponible"}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

export default function Menu() {
  const [name] = useQueryState("name", parseAsString.withDefault(""));

  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const isMediumScreen = useMediaQuery("(max-width: 1024px)");

  const {
    data: menuItems = [],
    isLoading,
    error,
  } = api.menu.getPublicMenuItems.useQuery();

  const numColumns = React.useMemo(() => {
    if (isSmallScreen) return 1;
    if (isMediumScreen) return 2;
    return 4;
  }, [isSmallScreen, isMediumScreen]);

  // Filtrar datos del lado del cliente
  const filteredData = React.useMemo(() => {
    return menuItems.filter((item) => {
      const matchesName =
        name === "" || item.name.toLowerCase().includes(name.toLowerCase());

      return matchesName;
    });
  }, [name, menuItems]);

  const columns = React.useMemo<ColumnDef<MenuItem>[]>(
    () => [
      ...Array.from({ length: numColumns }, (_, i) => ({
        id: `col${i + 1}`,
        header: "Productos",
        cell: ({ row }: { row: { index: number } }) => {
          const item = filteredData[row.index * numColumns + i];
          return item ? (
            <MenuItemCard item={item} />
          ) : (
            <div className="h-[320px]"></div>
          );
        },
        enableSorting: false,
      })),
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }: { column: Column<MenuItem, unknown> }) => (
          <DataTableColumnHeader column={column} title="Nombre" />
        ),
        cell: ({ cell }) => (
          <div className="hidden">{cell.getValue<MenuItem["name"]>()}</div>
        ),
        meta: {
          label: "Nombre",
          placeholder: "Buscar productos...",
          variant: "text",
          icon: Text,
        },
        enableColumnFilter: true,
      },
    ],
    [filteredData, numColumns],
  );

  // Calcular número de filas necesarias para mostrar 4 items por fila
  const rowData = React.useMemo<MenuItem[]>(() => {
    const numberOfRows = Math.ceil(filteredData.length / numColumns);
    const rows: MenuItem[] = [];

    // Crear filas dummy, cada fila representa un grupo de 4 items
    for (let i = 0; i < numberOfRows; i++) {
      const firstItem = filteredData[i * numColumns];
      if (firstItem) rows.push(firstItem);
    }

    return rows;
  }, [filteredData, numColumns]);

  const { table } = useDataTable<MenuItem>({
    data: rowData,
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: "name", desc: false }],
      columnVisibility: {
        name: false,
      },
    },
    getRowId: (row) => row.id,
  });

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="data-table-container">
      {/* Solo mostrar la toolbar con filtros */}
      <DataTableToolbar table={table} />

      {/* Tabla con estilos invisibles - solo mostrar las cards */}
      <div className="[&_table]:border-none [&_tbody_td]:border-none [&_tbody_td]:p-2 [&_tbody_tr]:border-none [&_thead]:hidden">
        <DataTable table={table} />
      </div>
    </div>
  );
}
