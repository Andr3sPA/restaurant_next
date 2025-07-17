"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import ButtonLink from "@/components/main/buttonLink";

export default function Logged() {
  const router = useRouter();

  return (
    <div className="mt-4 flex justify-center gap-4">
      <ButtonLink
        onClick={() => {
          void signOut();
          router.push("/");
        }}
      >
        Cerrar sesion
      </ButtonLink>
    </div>
  );
}
