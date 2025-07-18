// Página de detalles de un elemento del menú. Muestra información detallada del ítem seleccionado.
import { MenuItemDetails } from "@/components/menu-item/menu-item-details";
import ReturnButton from "@/components/ReturnButton";
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
    <div className="m-auto my-16 flex w-auto flex-col gap-4">
      <div className="flex w-full items-center gap-2">
        <ReturnButton />
        <span className="text-lg font-light">Regresar</span>
      </div>
      {item ? (
        <MenuItemDetails
          id={item.id}
          title={item.name}
          description={item.description ?? "No description"}
          prefix={item.currency}
          price={item.price}
          inStock={item.available}
          imageUrl={item.image ?? undefined}
        />
      ) : (
        // Mensaje si el elemento no se encuentra
        <div>Item not found</div>
      )}
    </div>
  );
}
