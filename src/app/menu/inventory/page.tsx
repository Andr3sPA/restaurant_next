import { MenuItemsTable } from "@/components/inventoryTable";

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-4">
      <MenuItemsTable />
    </div>
  );
}