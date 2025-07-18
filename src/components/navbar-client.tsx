"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DarkModeSwitch } from "./darkModeSwitch";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface NavbarClientProps {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
}

const NavbarClient = ({
  logo = {
    url: "/",
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg",
    alt: "logo",
    title: "Shadcnblocks.com",
  },
  menu,
}: NavbarClientProps) => {
  const { data: session, status } = useSession();

  // Definir menús según el rol del usuario
  const clientMenu = [{ title: "Inicio", url: "/" }];

  const employeeMenu = [
    { title: "Inicio", url: "/" },
    { title: "Pedidos", url: "/orders" },
    { title: "Inventario", url: "/menu/inventory" },
    { title: "Añadir plato", url: "/menu/register" },
  ];

  const adminMenu = [
    { title: "Inicio", url: "/" },
    { title: "Pedidos", url: "/orders" },
    { title: "Usuarios", url: "/users" },
    { title: "Inventario", url: "/menu/inventory" },
    { title: "Métricas", url: "/metrics" },
  ];

  const getMenuByRole = () => {
    if (status === "loading" || !session?.user?.role) {
      return [{ title: "Inicio", url: "/" }];
    }

    switch (session.user.role) {
      case Role.CLIENT:
        return clientMenu;
      case Role.EMPLOYEE:
        return employeeMenu;
      case Role.ADMIN:
        return adminMenu;
      default:
        return adminMenu;
    }
  };

  // Calcular el menú seleccionado
  const selectedMenu = menu ?? getMenuByRole();

  return (
    <section className="py-4">
      <div className="container">
        {/* Desktop Menu */}
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-6 pl-4">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-2">
              <Image
                src={logo.src}
                className="max-h-8"
                alt={logo.alt}
                width={32}
                height={32}
              />
              <span className="text-lg font-semibold tracking-tighter">
                {logo.title}
              </span>
            </a>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {selectedMenu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DarkModeSwitch />
            <Button asChild variant="outline" size="sm">
              <Link href={session ? "/api/auth/signout" : "/user/signin"}>
                {session ? "Sign out" : "Sign in"}
              </Link>
            </Button>
            {!session && (
              <Button asChild size="sm">
                <Link href="/user/signup">Sign up</Link>
              </Button>
            )}
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between pr-4 pl-4">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-2">
              <Image
                src={logo.src}
                className="max-h-8"
                alt={logo.alt}
                width={32}
                height={32}
              />
            </a>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-fit overflow-y-auto px-6">
                <SheetHeader>
                  <SheetTitle>
                    <a href={logo.url} className="flex items-center gap-2">
                      <Image
                        src={logo.src}
                        className="max-h-8"
                        alt={logo.alt}
                        width={32}
                        height={32}
                      />
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex w-fit flex-col items-center gap-6 p-4">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-4"
                  >
                    {selectedMenu.map((item) => renderMobileMenuItem(item))}
                  </Accordion>

                  <div className="flex flex-col gap-3">
                    <DarkModeSwitch />
                    <Button asChild variant="outline">
                      <Link
                        href={session ? "/api/auth/signout" : "/user/signin"}
                      >
                        {session ? "Sign out" : "Sign in"}
                      </Link>
                    </Button>

                    {!session && (
                      <Button asChild>
                        <Link href="/user/signup">Sign up</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className="group bg-background hover:bg-muted hover:text-accent-foreground inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a key={item.title} href={item.url} className="text-md font-semibold">
      {item.title}
    </a>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="hover:bg-muted hover:text-accent-foreground flex flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
      href={item.url}
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-muted-foreground text-sm leading-snug">
            {item.description}
          </p>
        )}
      </div>
    </a>
  );
};

export { NavbarClient };
