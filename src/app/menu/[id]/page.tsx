// Página de detalles de un elemento del menú. Muestra información detallada del ítem seleccionado.
import { MenuItemDetails } from "@/components/menu-item/menu-item-details";
import { api } from "@/trpc/server";

export default async function MenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Obtiene el id del elemento y sus detalles desde la API
  const { id } = await params;
  const item = await api.menu.getMenuItemDetails(id);

  // Renderiza los detalles del elemento del menú
  return (
    <div className="flex h-full min-h-[500px] w-full items-center justify-center">
      {item ? (
        <div className="w-full max-w-2xl">
          <MenuItemDetails
            id={item.id}
            title={item.name}
            description={item.description ?? "No description"}
            prefix={item.currency}
            price={item.price}
            inStock={item.available}
            imageUrl={item.image ?? undefined}
          />
        </div>
      ) : (
        // Mensaje si el elemento no se encuentra
        <div>Item not found</div>
      )}
    </div>
  );
}
