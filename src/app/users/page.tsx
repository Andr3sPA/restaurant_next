import { UsersTable } from "@/components/usersTable";

export default function UsersPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion de usuarios
          </h1>
          <p className="text-muted-foreground">
            Maneja las cuentas de los usuarios y sus roles dentro del sistema.
          </p>
        </div>
        <UsersTable />
      </div>
    </div>
  );
}
