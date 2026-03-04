"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type SearchCriteria = "name" | "email";

type Props = {
  onSearch: (term: string, criteria: SearchCriteria) => void;
};

export default function UsersSearch({ onSearch }: Props) {
  const [criteria, setCriteria] = useState<SearchCriteria>("name");
  const [term, setTerm] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleSearch = () => {
    if (term.length === 0) {
      onSearch("", criteria);
      return;
    }

    if (term.length < 3) {
      setShowAlert(true);
      return;
    }

    onSearch(term, criteria);
  };

  return (
    <>
      <div className="flex items-center gap-2 border rounded-md p-2">
        <Select
          value={criteria}
          onValueChange={(value) => setCriteria(value as SearchCriteria)}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Ime</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select>

        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="min. tri slova"
          className="w-48"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />

        <Button onClick={handleSearch}>Traži</Button>
      </div>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pretraživanje</AlertDialogTitle>
            <AlertDialogDescription>
              Za pretragu je potrebno upisati najmanje tri znaka.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAlert(false)}>
              U redu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}