// Página principal de la aplicación. Muestra el menú y el saludo, y controla la autenticación.
import { auth } from "@/server/auth";
import NotLogged from "@/components/main/notLogged";
import TitleGreeting from "@/components/main/titleGreeting";
import Sidebar from "@/components/main/sidebar/sidebar";
import Menu from "@/components/main/menu";

export default async function Home() {
  // Obtiene la sesión del usuario para mostrar contenido personalizado
  const session = await auth();

  // Renderiza la página principal con menú y saludo
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white sm:flex-row">
      {/* Muestra la barra lateral solo si el usuario está autenticado */}
      {session ? <Sidebar /> : null}
      <div className="mx-auto flex flex-col gap-y-5 px-4 py-8 text-center">
        <TitleGreeting />
        {/* Muestra mensaje si el usuario no está autenticado */}
        {session ? null : <NotLogged />}
        {/* Menú principal */}
        {<Menu />}
      </div>
    </main>
  );
}
