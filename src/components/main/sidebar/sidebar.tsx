import SidebarInfo from "./sidebarInfo";

export default function Sidebar() {
  return (
    <>
      <aside className="hidden flex-col gap-y-4 overflow-y-auto bg-white px-5 py-5 text-black lg:flex">
        <SidebarInfo />
      </aside>
    </>
  );
}
