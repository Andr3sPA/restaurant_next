import { MenuItemDetails } from "@/components/menu-item/menu-item-details";
import { api } from "@/trpc/server";

export default async function MenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await api.menu.getMenuItemDetails(id);

  return (
    <div className="flex h-dvh items-center justify-center">
      {item ? (
        <MenuItemDetails
          title={item.name}
          description={item.description ?? "No description"}
          prefix={item.currency}
          price={item.price}
          inStock={item.available}
          imageUrl={item.image !== null ? item.image : undefined}
        />
      ) : (
        <div>Item not found</div>
      )}
    </div>
  );
}
