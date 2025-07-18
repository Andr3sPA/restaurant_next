// Página para la gestión del inventario del menú. Permite administrar los elementos del menú.
import { MenuItemsTable } from "@/components/InventoryTable/MenuItemsTable";
import ReturnButton from "@/components/ReturnButton";
import TableTitle from "@/components/TableTitle";
import TableDescription from "@/components/TableDescription";
import Link from "next/link";

export default function InventoryPage() {
  // Renderiza la interfaz principal de gestión de inventario del menú
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
        {/* Tabla principal de inventario */}
        <MenuItemsTable />
        <div className="mt-4 flex justify-end">
          <Link href="/menu/register">
            <button className="bg-primary hover:bg-primary/80 rounded-md px-4 py-2 text-white transition">
              Añadir nuevo elemento
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
