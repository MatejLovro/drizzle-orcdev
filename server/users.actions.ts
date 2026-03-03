"use server";

import { db } from "@/db/db"; // prilagodi putanju prema svojoj konfiguraciji
import { users } from "@/db/schema"; // prilagodi putanju prema svojoj konfiguraciji
import { eq } from "drizzle-orm";

// Tipovi
type CreateUserInput = {
  name: string;
  email: string;
  username: string;
  password: string;
};

type UpdateUserInput = {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
};

// ----------------------------------------------------------------
// READ ALL — Dohvat svih korisnika
// ----------------------------------------------------------------
export async function getAllUsers() {
  try {
    const allUsers = await db.select().from(users);

    return { success: true, data: allUsers };
  } catch (error) {
    console.error("Greška pri dohvatu korisnika:", error);
    return { success: false, error: "Nije moguće dohvatiti korisnike." };
  }
}


// ----------------------------------------------------------------
// UPDATE — Ažuriranje korisnika po ID-u
// ----------------------------------------------------------------
export async function updateUser(id: string, data: UpdateUserInput) {
  try {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      return { success: false, error: "Korisnik nije pronađen." };
    }

    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Greška pri ažuriranju korisnika:", error);
    return { success: false, error: "Nije moguće ažurirati korisnika." };
  }
}

// ----------------------------------------------------------------
// CREATE — Kreiranje novog korisnika
// ----------------------------------------------------------------
export async function createUser(data: CreateUserInput) {
  try {
    const [newUser] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        username: data.username,
        password: data.password, // napomena: lozinku hashiraj prije pohrane (npr. bcrypt)
      })
      .returning();

    return { success: true, data: newUser };
  } catch (error) {
    console.error("Greška pri kreiranju korisnika:", error);
    return { success: false, error: "Nije moguće kreirati korisnika." };
  }
}


// ----------------------------------------------------------------
// READ ONE — Dohvat korisnika po ID-u
// ----------------------------------------------------------------
export async function getUserById(id: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));

    if (!user) {
      return { success: false, error: "Korisnik nije pronađen." };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Greška pri dohvatu korisnika:", error);
    return { success: false, error: "Nije moguće dohvatiti korisnika." };
  }
}

// ----------------------------------------------------------------
// READ ONE — Dohvat korisnika po emailu
// ----------------------------------------------------------------
export async function getUserByEmail(email: string) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return { success: false, error: "Korisnik nije pronađen." };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Greška pri dohvatu korisnika po emailu:", error);
    return { success: false, error: "Nije moguće dohvatiti korisnika." };
  }
}


// ----------------------------------------------------------------
// DELETE — Brisanje korisnika po ID-u
// ----------------------------------------------------------------
export async function deleteUser(id: string) {
  try {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!deletedUser) {
      return { success: false, error: "Korisnik nije pronađen." };
    }

    return { success: true, data: deletedUser };
  } catch (error) {
    console.error("Greška pri brisanju korisnika:", error);
    return { success: false, error: "Nije moguće obrisati korisnika." };
  }
}


export async function checkEmailExists(email: string, excludeId: string) {
  try {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!existingUser || existingUser.id === excludeId) {
      return { success: true, exists: false };
    }

    return { success: true, exists: true };
  } catch (error) {
    console.error("Greška pri provjeri emaila:", error);
    return { success: false, exists: false, error: "Greška pri provjeri emaila." };
  }
}