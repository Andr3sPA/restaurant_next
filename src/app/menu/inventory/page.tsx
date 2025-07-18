import { MenuItemsTable } from "@/components/InventoryTable/MenuItemsTable";
import ReturnButton from "@/components/ReturnButton";
import TableTitle from "@/components/TableTitle";
import TableDescription from "@/components/TableDescription";

export default function InventoryPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <ReturnButton />
            <TableTitle title="Inventario de Menú" />
          </div>
          <TableDescription description="Gestiona los elementos del menú, incluyendo precios, disponibilidad e imágenes." />
        </div>
        <MenuItemsTable />
      </div>
    </div>
  );
}
