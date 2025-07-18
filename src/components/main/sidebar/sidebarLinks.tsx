import ButtonLink from "@/components/main/buttonLink";
import { Archive, TableProperties, UserRoundCog } from "lucide-react";
import { auth } from "@/server/auth";

const SharedLinks = [
  { text: "Transacciones", link: "/transactions/", icon: TableProperties },
];

const AdminLinks = [
  { text: "Usuarios", link: "/users/", icon: UserRoundCog },
  { text: "Inventario", link: "/menu/inventory/", icon: Archive },
];

export default async function SidebarLinks() {
  const session = await auth();

  return (
    <div className="flex w-full flex-col gap-y-2">
      {session?.user.role === "ADMIN" &&
        AdminLinks.map((item) => (
          <ButtonLink key={item.link} href={item.link}>
            <item.icon />
            {item.text}
          </ButtonLink>
        ))}
      {SharedLinks.map((item) => (
        <ButtonLink key={item.link} href={item.link}>
          <item.icon />
          {item.text}
        </ButtonLink>
      ))}
    </div>
  );
}
