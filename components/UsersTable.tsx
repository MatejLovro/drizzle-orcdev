"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowUpDown, ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";
import { deleteUser } from "@/server/users.actions";
import EditUserDialog from "@/components/EditUserDialog";
import UsersSearch from "@/components/UsersSearch";
import { Button } from "@/components/ui/button";
import AddUserDialog from "./AddUserDialog";

type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  createdAt: Date | null;
};

type SortDirection = "asc" | "desc" | null;
type SearchCriteria = "name" | "email";

export default function UsersTable({ users }: { users: User[] }) {
  const router = useRouter();
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>("name");

  const handleNameSort = () => {
    setSortDirection((prev) => {
      if (prev === null) return "asc";
      if (prev === "asc") return "desc";
      return null;
    });
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      setIsDeleting(true);

      // TODO: Ovdje napraviti provjeru postoje li vezani zapisi u drugim
      // tablicama (npr. rezervacije, smještaji) prije brisanja korisnika.
      // Ako postoje, prikazati odgovarajuću poruku i prekinuti brisanje.

      const result = await deleteUser(selectedUser.id);
      if (!result.success) {
        console.error("Greška pri brisanju:", result.error);
        return;
      }
      router.refresh();
    } catch (error) {
      console.error("Greška pri brisanju korisnika:", error);
    } finally {
      setIsDeleting(false);
      setSelectedUser(null);
    }
  };

  const handleSearch = (term: string, criteria: SearchCriteria) => {
    setSearchTerm(term);
    setSearchCriteria(criteria);
  };

  // Filtriranje
  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    const value = user[searchCriteria].toLowerCase();
    return value.includes(searchTerm.toLowerCase());
  });

  // Sortiranje
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortDirection === "asc") return a.name.localeCompare(b.name);
    if (sortDirection === "desc") return b.name.localeCompare(a.name);
    return 0;
  });

  const SortIcon = () => {
    if (sortDirection === "asc") return <ArrowUp size={14} />;
    if (sortDirection === "desc") return <ArrowDown size={14} />;
    return <ArrowUpDown size={14} />;
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4">
        <UsersSearch onSearch={handleSearch} />
        <AddUserDialog />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              onClick={handleNameSort}
              className="cursor-pointer select-none"
            >
              <div className="flex items-center gap-1">
                Ime
                <SortIcon />
              </div>
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Kreiran</TableHead>
            <TableHead className="text-center">Izmjena</TableHead>
            <TableHead className="text-center">Brisanje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500 py-6">
                Nema korisnika koji odgovaraju kriteriju pretrage.
              </TableCell>
            </TableRow>
          ) : (
            sortedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("hr-HR")
                    : "-"}
                </TableCell>
                <TableCell className="text-center">
                  <button
                    onClick={() => setEditUser(user)}
                    className="text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                </TableCell>
                <TableCell className="text-center">
                  <button
                    onClick={() => handleDeleteClick(user)}
                    className="text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Delete dialog */}
      <AlertDialog
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jeste li sigurni?</AlertDialogTitle>
            <AlertDialogDescription>
              Jeste li sigurni da korisnika{" "}
              <span className="font-semibold text-foreground">
                {selectedUser?.name}
              </span>{" "}
              želite izbrisati?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Odustani
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Brisanje..." : "Da, izbriši"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      {editUser && (
        <EditUserDialog
          user={editUser}
          open={!!editUser}
          onOpenChange={(open) => !open && setEditUser(null)}
        />
      )}
    </>
  );
}
