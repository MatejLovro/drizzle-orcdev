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



export default async function Home() {

  const { success, data: users, error } = await getAllUsers();

  if (!success) {
    return <p className="text-red-500">Greška: {error}</p>;
  }

  if (!users || users.length === 0) {
    return <p className="text-gray-500">Ne postoji nijedan korisnik.</p>;
  }

 return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Korisnici</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ime</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Kreiran</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("hr-HR")
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
  
}
