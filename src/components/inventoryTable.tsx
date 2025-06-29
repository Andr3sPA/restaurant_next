"use client";
 
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
 
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataTable } from "@/hooks/use-data-table";
import { api } from "@/trpc/react";
 
import type { Column, ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle,
  CheckCircle2,
  DollarSign,
  MoreHorizontal,
  Text,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import Image from "next/image";

// Componente separado para manejar el estado de la imagen
function MenuItemImage({ imageUrl }: { imageUrl: string | null }) {
  const [imageError, setImageError] = React.useState(false);
  
  // Función para optimizar URLs de Cloudinary
  const optimizeCloudinaryUrl = (url: string) => {
    if (url.includes('cloudinary.com')) {
      // Si la URL ya tiene transformaciones, la usamos tal como está
      if (url.includes('/c_')) return url;
      
      // Si no tiene transformaciones, agregamos algunas optimizaciones básicas
      const parts = url.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/c_fill,w_48,h_48,q_auto,f_auto/${parts[1]}`;
      }
    }
    return url;
  };
  
  return (
    <div className="flex items-center justify-center w-12 h-12">
      {imageUrl && !imageError ? (
        <Image
          src={optimizeCloudinaryUrl(imageUrl)}
          alt="Menu item"
          width={48}
          height={48}
          className="rounded-md object-cover"
          onError={() => setImageError(true)}
          priority={false}
          unoptimized={false} // Permitir optimización de Next.js para Cloudinary
        />
      ) : (
        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-gray-400" />
        </div>
      )}
    </div>
  );
}
 
interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  price: number;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
  image: string | null;
}
 
export function MenuItemsTable() {
  const [name] = useQueryState("name", parseAsString.withDefault(""));
  const [available] = useQueryState(
    "available",
    parseAsArrayOf(parseAsString).withDefault([]),
  );

  // Fetch menu items using tRPC
  const { data: menuItems = [], isLoading, error } = api.menu.getMenuItems.useQuery();
 
  // Filter the data client-side
  const filteredData = React.useMemo(() => {
    return menuItems.filter((item) => {
      const matchesName =
        name === "" ||
        item.name.toLowerCase().includes(name.toLowerCase());
      const matchesAvailable =
        available.length === 0 || 
        available.includes(item.available ? "available" : "unavailable");
 
      return matchesName && matchesAvailable;
    });
  }, [name, available, menuItems]);
 
  const columns = React.useMemo<ColumnDef<MenuItem>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        size: 32,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "image",
        accessorKey: "image",
        header: "Image",
        cell: ({ cell }) => {
          const imageUrl = cell.getValue<MenuItem["image"]>();
          return <MenuItemImage imageUrl={imageUrl} />;
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }: { column: Column<MenuItem, unknown> }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ cell }) => <div className="font-medium">{cell.getValue<MenuItem["name"]>()}</div>,
        meta: {
          label: "Name",
          placeholder: "Search names...",
          variant: "text",
          icon: Text,
        },
        enableColumnFilter: true,
      },
      {
        id: "description",
        accessorKey: "description",
        header: ({ column }: { column: Column<MenuItem, unknown> }) => (
          <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ cell }) => {
          const description = cell.getValue<MenuItem["description"]>();
          return (
            <div className="max-w-[200px] truncate text-sm text-muted-foreground">
              {description ?? "No description"}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: "available",
        accessorKey: "available",
        header: ({ column }: { column: Column<MenuItem, unknown> }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ cell }) => {
          const available = cell.getValue<MenuItem["available"]>();
          const Icon = available ? CheckCircle2 : XCircle;
 
          return (
            <Badge variant={available ? "default" : "secondary"} className="capitalize">
              <Icon className="w-3 h-3 mr-1" />
              {available ? "Available" : "Unavailable"}
            </Badge>
          );
        },
        meta: {
          label: "Status",
          variant: "multiSelect",
          options: [
            { label: "Available", value: "available", icon: CheckCircle },
            { label: "Unavailable", value: "unavailable", icon: XCircle },
          ],
        },
        enableColumnFilter: true,
      },
      {
        id: "price",
        accessorKey: "price",
        header: ({ column }: { column: Column<MenuItem, unknown> }) => (
          <DataTableColumnHeader column={column} title="Price" />
        ),
        cell: ({ cell, row }) => {
          const price = cell.getValue<MenuItem["price"]>();
          const currency = row.original.currency;
 
          return (
            <div className="flex items-center gap-1 font-medium">
              <DollarSign className="size-4" />
              {price.toLocaleString()} {currency}
            </div>
          );
        },
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: ({ column }: { column: Column<MenuItem, unknown> }) => (
          <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ cell }) => {
          const date = cell.getValue<MenuItem["createdAt"]>();
          return (
            <div className="text-sm text-muted-foreground">
              {new Date(date).toLocaleDateString()}
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: function Cell({ row }) {
          const menuItem = row.original;
          
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>
                  {menuItem.available ? "Mark as Unavailable" : "Mark as Available"}
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 32,
      },
    ],
    [],
  );
 
  const { table } = useDataTable({
    data: filteredData,
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return (
      <div className="data-table-container">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading menu items...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="data-table-container">
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">Error loading menu items: {error.message}</div>
        </div>
      </div>
    );
  }
 
  return (
    <div className="data-table-container">
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
