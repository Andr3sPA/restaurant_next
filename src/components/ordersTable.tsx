"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

import { useDataTable } from "@/hooks/use-data-table";
import { api } from "@/trpc/react";

import type { Column, ColumnDef } from "@tanstack/react-table";
import {
  Clock,
  DollarSign,
  User,
  CheckCircle,
  Truck,
  XCircle,
  ChefHat,
  Package,
  Eye,
} from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { type OrderStatus } from "@prisma/client";

interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  total: number;
  phone: string;
  address: string;
  user: {
    name: string | null;
    email: string;
  };
}

function OrderDetailsDialog({ orderId }: { orderId: string }) {
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<OrderStatus | "">(
    "",
  );

  const utils = api.useUtils();

  const { data: orderDetails, isLoading } = api.order.getOrderDetails.useQuery(
    orderId,
    {
      enabled: open,
    },
  );

  const { mutate: updateOrderStatus, isPending } =
    api.order.updateOrderStatus.useMutation({
      onSuccess: () => {
        toast.success("Estado del pedido actualizado correctamente.");
        void utils.order.getOrders.invalidate();
        setOpen(false);
      },
      onError: () => {
        toast.error("Error al actualizar el estado del pedido.");
      },
    });

  React.useEffect(() => {
    if (orderDetails) {
      setSelectedStatus(orderDetails.status);
    }
  }, [orderDetails]);

  const handleStatusUpdate = () => {
    if (selectedStatus && selectedStatus !== orderDetails?.status) {
      updateOrderStatus({
        orderId,
        status: selectedStatus,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="mr-2 h-4 w-4" />
          Detalles
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles del Pedido</DialogTitle>
          <DialogDescription>
            Información completa del pedido #{orderId}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Cargando detalles...</div>
          </div>
        ) : orderDetails ? (
          <div className="space-y-6">
            {/* Información del cliente */}
            <div>
              <h3 className="mb-2 font-semibold">Información del Cliente</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Nombre:</span>{" "}
                  {orderDetails.user.name ?? "Sin nombre"}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {orderDetails.user.email}
                </p>
                <p>
                  <span className="font-medium">Teléfono:</span>{" "}
                  {orderDetails.phone}
                </p>
                <p>
                  <span className="font-medium">Dirección:</span>{" "}
                  {orderDetails.address}
                </p>
              </div>
            </div>

            <Separator />

            {/* Items del pedido */}
            <div>
              <h3 className="mb-2 font-semibold">Items del Pedido</h3>
              <ScrollArea className="h-[180px] w-full rounded-md border">
                <div className="space-y-2 p-2">
                  {orderDetails.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="text-muted-foreground h-4 w-4" />
                        <div>
                          <p className="font-medium">{item.menuItem.name}</p>
                          <p className="text-muted-foreground text-sm">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${item.subtotal.toFixed(2)}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          ${(item.subtotal / item.quantity).toFixed(2)} c/u
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Separator />

            {/* Total y estado */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">
                  Total: ${orderDetails.total.toFixed(2)}
                </p>
                <p className="text-muted-foreground text-sm">
                  Fecha: {new Date(orderDetails.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Estado del Pedido:
                </label>
                <div className="flex gap-2">
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) =>
                      setSelectedStatus(value as OrderStatus | "")
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendiente</SelectItem>
                      <SelectItem value="PREPARING">Preparando</SelectItem>
                      <SelectItem value="READY">Listo</SelectItem>
                      <SelectItem value="DELIVERED">Entregado</SelectItem>
                      <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={
                      isPending || selectedStatus === orderDetails.status
                    }
                    size="sm"
                  >
                    {isPending ? "Actualizando..." : "Actualizar"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground py-8 text-center">
            No se pudieron cargar los detalles del pedido.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Componente para gestionar pedidos con tabla que muestra información básica y permite ver detalles
export function OrdersTable() {
  const [status] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString).withDefault([]),
  );

  const utils = api.useUtils();

  const {
    data: orders = [],
    isLoading,
    error,
  } = api.order.getOrders.useQuery();

  const { mutate: updateOrderStatus } = api.order.updateOrderStatus.useMutation(
    {
      onMutate: async (newOrder) => {
        await utils.order.getOrders.cancel();
        const previousOrders = utils.order.getOrders.getData();
        utils.order.getOrders.setData(undefined, (old) =>
          old?.map((order) =>
            order.id === newOrder.orderId
              ? { ...order, status: newOrder.status }
              : order,
          ),
        );
        return { previousOrders };
      },
      onSuccess: () => {
        toast.success("Estado del pedido actualizado.");
      },
      onError: (err, newOrder, context) => {
        utils.order.getOrders.setData(undefined, context?.previousOrders);
        toast.error("Error al actualizar el estado del pedido.");
      },
      onSettled: () => {
        void utils.order.getOrders.invalidate();
      },
    },
  );

  const filteredData = React.useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        status.length === 0 || status.includes(order.status);
      return matchesStatus;
    });
  }, [status, orders]);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return Clock;
      case "PREPARING":
        return ChefHat;
      case "READY":
        return CheckCircle;
      case "DELIVERED":
        return Truck;
      case "CANCELLED":
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "secondary";
      case "PREPARING":
        return "outline";
      case "READY":
        return "default";
      case "DELIVERED":
        return "default";
      case "CANCELLED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "Pendiente";
      case "PREPARING":
        return "Preparando";
      case "READY":
        return "Listo";
      case "DELIVERED":
        return "Entregado";
      case "CANCELLED":
        return "Cancelado";
      default:
        return status;
    }
  };

  const columns = React.useMemo<ColumnDef<Order>[]>(
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
        id: "id",
        accessorKey: "id",
        header: ({ column }: { column: Column<Order, unknown> }) => (
          <DataTableColumnHeader column={column} title="ID" />
        ),
        cell: ({ cell }) => (
          <div className="text-muted-foreground text-sm">
            {cell.getValue<Order["id"]>().slice(0, 8)}...
          </div>
        ),
        enableColumnFilter: true,
      },
      {
        id: "userName",
        accessorFn: (row) => row.user.name ?? row.user.email,
        header: ({ column }: { column: Column<Order, unknown> }) => (
          <DataTableColumnHeader column={column} title="Cliente" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <User className="text-muted-foreground h-4 w-4" />
            <div>
              <div className="font-medium">
                {row.original.user.name ?? "Sin nombre"}
              </div>
              <div className="text-muted-foreground text-sm">
                {row.original.user.email}
              </div>
            </div>
          </div>
        ),
        meta: {
          label: "Cliente",
          placeholder: "Buscar cliente...",
          variant: "text",
          icon: User,
        },
        enableColumnFilter: true,
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: ({ column }: { column: Column<Order, unknown> }) => (
          <DataTableColumnHeader column={column} title="Fecha" />
        ),
        cell: ({ cell }) => {
          const date = cell.getValue<Order["createdAt"]>();
          return (
            <div className="text-sm">
              <div>{new Date(date).toLocaleDateString()}</div>
              <div className="text-muted-foreground">
                {new Date(date).toLocaleTimeString()}
              </div>
            </div>
          );
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }: { column: Column<Order, unknown> }) => (
          <DataTableColumnHeader column={column} title="Estado" />
        ),
        cell: ({ cell }) => {
          const status = cell.getValue<Order["status"]>();
          const Icon = getStatusIcon(status);

          return (
            <Badge variant={getStatusVariant(status)} className="capitalize">
              <Icon className="mr-1 h-3 w-3" />
              {getStatusLabel(status)}
            </Badge>
          );
        },
        meta: {
          label: "Estado",
          variant: "multiSelect",
          options: [
            { label: "Pendiente", value: "PENDING", icon: Clock },
            { label: "Preparando", value: "PREPARING", icon: ChefHat },
            { label: "Listo", value: "READY", icon: CheckCircle },
            { label: "Entregado", value: "DELIVERED", icon: Truck },
            { label: "Cancelado", value: "CANCELLED", icon: XCircle },
          ],
        },
        enableColumnFilter: true,
      },
      {
        id: "total",
        accessorKey: "total",
        header: ({ column }: { column: Column<Order, unknown> }) => (
          <DataTableColumnHeader column={column} title="Total" />
        ),
        cell: ({ cell }) => {
          const total = cell.getValue<Order["total"]>();

          return (
            <div className="flex items-center gap-1 font-medium">
              <DollarSign className="size-4" />${total.toFixed(2)}
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: function Cell({ row }) {
          const order = row.original;

          return <OrderDetailsDialog orderId={order.id} />;
        },
        size: 120,
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
        <div className="flex h-64 items-center justify-center">
          <div className="text-muted-foreground">Cargando pedidos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="data-table-container">
        <div className="flex h-64 items-center justify-center">
          <div className="text-destructive">
            Error cargando pedidos: {error.message}
          </div>
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
