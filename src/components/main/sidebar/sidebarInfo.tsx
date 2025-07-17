import { auth } from "@/server/auth";
import { CircleUserRound } from "lucide-react";

export default async function SidebarInfo() {
  const session = await auth();

  return (
    <div className="flex flex-col items-center gap-y-4">
      <CircleUserRound />
      <h1 className="text-sm font-semibold sm:text-lg">{session?.user.name}</h1>
    </div>
  );
}
