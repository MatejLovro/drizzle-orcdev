import { getAllUsers } from "@/server/users.actions";
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
      <h1 className="text-2xl font-bold mb-4">Korisnici</h1>
      <UsersTable users={users} />
    </div>
  );
  
}
