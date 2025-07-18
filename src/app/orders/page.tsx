import { OrdersTable } from "@/components/ordersTable";

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-4 overflow-y-scroll">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
      </div>
      <OrdersTable />
    </div>
  );
}
