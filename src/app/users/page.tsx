import { UsersTable } from "@/components/usersTable";

export default function UsersPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and their roles in the system.
          </p>
        </div>
        <UsersTable />
      </div>
    </div>
  );
}
