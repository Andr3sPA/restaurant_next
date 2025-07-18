import { OrdersTable } from "@/components/OrdersTable/OrdersTable";
import ReturnButton from "@/components/ReturnButton";
import TableTitle from "@/components/TableTitle";
import TableDescription from "@/components/TableDescription";

export default function OrdersPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <ReturnButton />
            <TableTitle title="Gestión de Pedidos" />
          </div>
          <TableDescription description="Administra los pedidos de los clientes, actualiza estados y revisa detalles de cada orden." />
        </div>
        <OrdersTable />
      </div>
    </div>
  );
}
