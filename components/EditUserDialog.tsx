"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { updateUser } from "@/server/users.actions";
import { checkEmailExists } from "@/server/users.actions";

type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  createdAt: Date | null;
};

type EditFormData = {
  name: string;
  email: string;
  password: string;
};

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;

const validatePassword = (value: string): string | undefined => {
  if (!value.trim()) return "Lozinku morate upisati";
  if (value.length < PASSWORD_MIN) return `Lozinka mora imati najmanje ${PASSWORD_MIN} znakova`;
  if (!/[A-Z]/.test(value)) return "Lozinka mora sadržavati barem jedno veliko slovo";
  if (!/[0-9]/.test(value)) return "Lozinka mora sadržavati barem jedan broj";
  if (!/[!@#$%^&*]/.test(value)) return "Lozinka mora sadržavati barem jedan poseban znak (!@#$%^&*)";
  return undefined;
};

type Props = {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function EditUserDialog({ user, open, onOpenChange }: Props) {
  const router = useRouter();

  const [formData, setFormData] = useState<EditFormData>({
    name: user.name,
    email: user.email,
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value);
    if (value) {
      setFormData({ name: user.name, email: user.email, password: "" });
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

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);

      // Provjera postoji li email kod drugog korisnika
      const emailCheck = await checkEmailExists(formData.email, user.id);

      if (emailCheck.exists) {
        setErrors({
          email: "Upisana mail adresa je već evidentirana kod drugog korisnika, ispravite je.",
        });
        return;
      }

      const result = await updateUser(user.id, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (!result.success) {
        console.error("Greška pri ažuriranju:", result.error);
        return;
      }

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Greška pri ažuriranju korisnika:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Izmjena korisnika</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-name">Ime</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Unesite ime"
            />
            {errors.name && (
              <span className="text-red-500 text-xs">{errors.name}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
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
            <Label htmlFor="edit-username">Username</Label>
            <Input
              id="edit-username"
              value={user.username}
              disabled
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-password">Lozinka</Label>
            <div className="relative">
              <Input
                id="edit-password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handlePasswordChange}
                placeholder="Unesite novu lozinku"
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

          <Button className="mt-2" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Spremanje..." : "Spremi"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}