"use client";
 
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useDataTable } from "@/hooks/use-data-table";
import { api } from "@/trpc/react";
import { Role } from "@prisma/client";
import { toast } from "sonner";
 
import type { Column, ColumnDef } from "@tanstack/react-table";
import {
  Crown,
  Text,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";

// Componente para confirmar eliminación de usuario
function DeleteUserDialog({ user, onDelete }: { 
  user: { id: string; name: string | null; email: string; role: Role }; 
  onDelete: (userId: string) => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="w-4 h-4 mr-1" />
          Delete User
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user{" "}
            <strong>{user.name ?? user.email}</strong> and remove all their data from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => onDelete(user.id)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Componente para cambiar el rol del usuario
function RoleSelector({ user, onRoleChange }: { 
  user: { id: string; name: string | null; email: string; role: Role }; 
  onRoleChange: (userId: string, newRole: Role) => void;
}) {
  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return Crown;
      case Role.EMPLOYEE:
        return Users;
      case Role.CLIENT:
        return User;
      default:
        return User;
    }
  };

  const getRoleVariant = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return "destructive" as const;
      case Role.EMPLOYEE:
        return "default" as const;
      case Role.CLIENT:
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  };

  const Icon = getRoleIcon(user.role);

  return (
    <Select
      value={user.role}
      onValueChange={(newRole: Role) => onRoleChange(user.id, newRole)}
    >
      <SelectTrigger className="w-auto border-none shadow-none">
        <Badge variant={getRoleVariant(user.role)} className="capitalize">
          <Icon className="w-3 h-3 mr-1" />
          {user.role.toLowerCase()}
        </Badge>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={Role.CLIENT}>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Client
          </div>
        </SelectItem>
        <SelectItem value={Role.EMPLOYEE}>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Employee
          </div>
        </SelectItem>
        <SelectItem value={Role.ADMIN}>
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Admin
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
 
export function UsersTable() {
  const [name] = useQueryState("name", parseAsString.withDefault(""));
  const [role] = useQueryState(
    "role",
    parseAsArrayOf(parseAsString).withDefault([]),
  );

  // Fetch users using tRPC
  const { data: users = [], isLoading, error, refetch } = api.user.getUsers.useQuery();
  
  // Definir el tipo basado en los datos reales
  type UserData = typeof users[number];

  // Mutation para cambiar el rol
  const changeRoleMutation = api.user.changeUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated successfully");
      void refetch(); // Refrescar la tabla
    },
    onError: (error) => {
      toast.error(`Failed to update user role: ${error.message}`);
    },
  });

  // Mutation para eliminar usuario
  const deleteUserMutation = api.user.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully");
      void refetch(); // Refrescar la tabla
    },
    onError: (error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });

  // Función para manejar el cambio de rol
  const handleRoleChange = React.useCallback((userId: string, newRole: Role) => {
    changeRoleMutation.mutate({
      userId,
      newRole,
    });
  }, [changeRoleMutation]);

  // Función para manejar la eliminación de usuario
  const handleDeleteUser = React.useCallback((userId: string) => {
    deleteUserMutation.mutate({ userId });
  }, [deleteUserMutation]);
 
  // Filter the data client-side
  const filteredData = React.useMemo(() => {
    return users.filter((user) => {
      const matchesName =
        name === "" ||
        (user.name?.toLowerCase().includes(name.toLowerCase()) ?? false) ||
        user.email.toLowerCase().includes(name.toLowerCase());
      const matchesRole =
        role.length === 0 || 
        role.includes(user.role);
 
      return matchesName && matchesRole;
    });
  }, [name, role, users]);
 
  const columns = React.useMemo<ColumnDef<UserData>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        size: 32,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "id",
        accessorKey: "id",
        header: ({ column }: { column: Column<UserData, unknown> }) => (
          <DataTableColumnHeader column={column} title="ID" />
        ),
        cell: ({ cell }) => (
          <div className="text-sm text-muted-foreground font-mono">
            {cell.getValue<UserData["id"]>().substring(0, 8)}...
          </div>
        ),
        enableColumnFilter: true,
      },
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }: { column: Column<UserData, unknown> }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ cell }) => {
          const name = cell.getValue<UserData["name"]>();
          return (
            <div className="font-medium">
              {name ?? <span className="text-muted-foreground italic">No name</span>}
            </div>
          );
        },
        meta: {
          label: "Name",
          placeholder: "Search names...",
          variant: "text",
          icon: Text,
        },
        enableColumnFilter: true,
      },
      {
        id: "email",
        accessorKey: "email",
        header: ({ column }: { column: Column<UserData, unknown> }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ cell }) => (
          <div className="text-sm">{cell.getValue<UserData["email"]>()}</div>
        ),
        enableColumnFilter: true,
      },
      {
        id: "role",
        accessorKey: "role",
        header: ({ column }: { column: Column<UserData, unknown> }) => (
          <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ row }) => {
          const user = row.original;
          return (
            <RoleSelector 
              user={user} 
              onRoleChange={handleRoleChange}
            />
          );
        },
        meta: {
          label: "Role",
          variant: "multiSelect",
          options: [
            { label: "Admin", value: Role.ADMIN, icon: Crown },
            { label: "Employee", value: Role.EMPLOYEE, icon: Users },
            { label: "Client", value: Role.CLIENT, icon: User },
          ],
        },
        enableColumnFilter: true,
      },
      {
        id: "delete",
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <DeleteUserDialog 
              user={user} 
              onDelete={handleDeleteUser}
            />
          );
        },
        size: 120,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [handleRoleChange, handleDeleteUser],
  );
 
  const { table } = useDataTable({
    data: filteredData,
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: "name", desc: false }],
      columnPinning: { right: ["delete"] },
    },
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return (
      <div className="data-table-container">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading users...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="data-table-container">
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">Error loading users: {error.message}</div>
        </div>
      </div>
    );
  }
 
  return (
    <div className="data-table-container">
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
