import { getAllUsers } from "@/server/users.actions";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import AddUserDialog from "@/components/AddUserDialog";
import UsersTable from "@/components/UsersTable";


export default async function UsersPage() {

  const { success, data: users, error } = await getAllUsers();

  if (!success) {
    return <p className="text-red-500">Greška: {error}</p>;
  }

  if (!users || users.length === 0) {
    return <p className="text-gray-500">Ne postoji nijedan korisnik.</p>;
  }

 return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Korisnici</h1>

      <div className="flex justify-end mb-4">
       <AddUserDialog />
      </div>
      
     <UsersTable users={users} />
    </div>
  );
  
}
