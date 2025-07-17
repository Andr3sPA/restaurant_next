import Link from "next/link";

import { auth } from "@/server/auth";
import NotLogged from "@/components/main/notLogged";
import TitleGreeting from "@/components/main/titleGreeting";
import Sidebar from "@/components/main/sidebar/sidebar";
import Logged from "@/components/main/logged";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white sm:flex-row">
      {session ? <Sidebar /> : null}

      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <TitleGreeting />
        {session ? <Logged /> : <NotLogged />}
        {session?.user?.name ?? session?.user?.email ?? null}
        {session?.user.role}
      </div>
    </main>
  );
}
