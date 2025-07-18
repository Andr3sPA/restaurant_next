import { auth } from "@/server/auth";
import NotLogged from "@/components/main/notLogged";
import TitleGreeting from "@/components/main/titleGreeting";
import Sidebar from "@/components/main/sidebar/sidebar";
import Menu from "@/components/main/menu";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white sm:flex-row">
      {session ? <Sidebar /> : null}
      <div className="mx-auto flex flex-col gap-y-5 px-4 py-8 text-center">
        <TitleGreeting />
        {session ? null : <NotLogged />}
        {<Menu />}
      </div>
    </main>
  );
}
