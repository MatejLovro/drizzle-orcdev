"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { createUser } from "@/server/users.actions";

type UserFormData = {
  name: string;
  email: string;
  username: string;
  password: string;
};

type FormErrors = {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-z0-9_]+$/;

const USERNAME_MIN = 3;
const USERNAME_MAX = 20;
const PASSWORD_MIN = 8;

const validatePassword = (value: string): string | undefined => {
  if (!value.trim()) return "Lozinku morate upisati";
  if (value.length < PASSWORD_MIN) return `Lozinka mora imati najmanje ${PASSWORD_MIN} znakova`;
  if (!/[A-Z]/.test(value)) return "Lozinka mora sadržavati barem jedno veliko slovo";
  if (!/[0-9]/.test(value)) return "Lozinka mora sadržavati barem jedan broj";
  if (!/[!@#$%^&*]/.test(value)) return "Lozinka mora sadržavati barem jedan poseban znak (!@#$%^&*)";
  return undefined;
};



export default function AddUserDialog() {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);

  const router = useRouter();
const [isLoading, setIsLoading] = useState(false);

  const handleOpenChange = (value: boolean) => {
  setOpen(value);
  if (value) {
    setFormData({ name: "", email: "", username: "", password: "" });
    setErrors({});
  }
};


  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
    setFormData({ ...formData, name: capitalized });
    if (capitalized.trim()) setErrors({ ...errors, name: undefined });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    if (!value.trim()) {
      setErrors({ ...errors, email: "Email morate upisati" });
    } else if (!emailRegex.test(value)) {
      setErrors({ ...errors, email: "Email nije ispravan" });
    } else {
      setErrors({ ...errors, email: undefined });
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, username: value });
    if (!value.trim()) {
      setErrors({ ...errors, username: "Username morate upisati" });
    } else if (value.length < USERNAME_MIN) {
      setErrors({ ...errors, username: `Username mora imati najmanje ${USERNAME_MIN} znaka` });
    } else if (value.length > USERNAME_MAX) {
      setErrors({ ...errors, username: `Username ne smije imati više od ${USERNAME_MAX} znakova` });
    } else if (!usernameRegex.test(value)) {
      setErrors({ ...errors, username: "Username smije sadržavati samo mala slova, brojeve i _" });
    } else {
      setErrors({ ...errors, username: undefined });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    setErrors({ ...errors, password: validatePassword(value) });
  };

  const handleSubmit = async () => {
  const newErrors: FormErrors = {};

  if (!formData.name.trim()) {
    newErrors.name = "Ime korisnika morate upisati";
  }

  if (!formData.email.trim()) {
    newErrors.email = "Email morate upisati";
  } else if (!emailRegex.test(formData.email)) {
    newErrors.email = "Email nije ispravan";
  }

  if (!formData.username.trim()) {
    newErrors.username = "Username morate upisati";
  } else if (formData.username.length < USERNAME_MIN) {
    newErrors.username = `Username mora imati najmanje ${USERNAME_MIN} znaka`;
  } else if (formData.username.length > USERNAME_MAX) {
    newErrors.username = `Username ne smije imati više od ${USERNAME_MAX} znakova`;
  } else if (!usernameRegex.test(formData.username)) {
    newErrors.username = "Username smije sadržavati samo mala slova, brojeve i _";
  }

  const passwordError = validatePassword(formData.password);
  if (passwordError) newErrors.password = passwordError;

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  // Poziv createUser akcije
  try {
    setIsLoading(true);

    const result = await createUser({
      name: formData.name,
      email: formData.email,
      username: formData.username,
      password: formData.password,
    });

    if (!result.success) {
      // Provjera je li email ili username već zauzet
      if (result.error?.includes("email")) {
        setErrors({ email: "Korisnik s ovim emailom već postoji" });
      } else if (result.error?.includes("username")) {
        setErrors({ username: "Ovaj username je već zauzet" });
      } else {
        setErrors({ name: result.error });
      }
      return;
    }

    // Uspješan unos
    setOpen(false);
    router.refresh();

  } catch (error) {
    console.error("Greška pri unosu korisnika:", error);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Dodaj</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dodaj korisnika</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Ime</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Unesite ime"
            />
            {errors.name && (
              <span className="text-red-500 text-xs">{errors.name}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleEmailChange}
              placeholder="Unesite email"
            />
            {errors.email && (
              <span className="text-red-500 text-xs">{errors.email}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={handleUsernameChange}
              placeholder="Unesite username"
            />
            {errors.username && (
              <span className="text-red-500 text-xs">{errors.username}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Lozinka</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handlePasswordChange}
                placeholder="Unesite lozinku"
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-red-500 text-xs">{errors.password}</span>
            )}
          </div>

          <Button className="mt-2" onClick={handleSubmit}>Spremi</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}