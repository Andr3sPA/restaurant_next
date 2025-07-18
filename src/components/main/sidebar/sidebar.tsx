import SidebarInfo from "./sidebarInfo";
import SidebarLinks from "./sidebarLinks";

export default function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <>
      <aside className="hidden w-40 shrink-0 items-center gap-y-3 overflow-y-auto bg-white px-1 py-5 text-center text-black sm:flex sm:flex-col">
        <SidebarInfo />
        {children}
        <SidebarLinks />
      </aside>
    </>
  );
}
