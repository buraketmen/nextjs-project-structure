import {
  ProjectFile,
  AssignedFileNames,
  AssignedFileName,
} from "@/types/project";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo, useCallback } from "react";
import { clearFolderName, cn, findParentFile } from "@/lib/utils";
import { useProject } from "@/context/project-context";

interface RenameDialogProps {
  file: ProjectFile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRename: (newName: string) => void;
}

export function RenameDialog({
  file,
  open,
  onOpenChange,
  onRename,
}: RenameDialogProps) {
  const { projectStructure } = useProject();
  const [newName, setNewName] = useState(clearFolderName(file.name));
  const [error, setError] = useState<string | null>(null);

  const parent = useMemo(() => {
    return findParentFile(file, projectStructure);
  }, [projectStructure, file]);

  useEffect(() => {
    if (open) {
      setNewName(clearFolderName(file.name));
      setError(null);
    }
  }, [open, file.name]);

  const isNameExists = useCallback(
    (name: string) => {
      if (!parent || !parent.children) return false;
      return parent.children.some((f) => f.name === name && f.id !== file.id);
    },
    [parent, file]
  );

  const validateName = (name: string): boolean => {
    if (name.trim() === "") {
      setError("Name cannot be empty");
      return false;
    }
    if (name.includes(" ")) {
      setError("Name cannot contain spaces");
      return false;
    }
    if (name.startsWith("_") || name.startsWith("(") || name.endsWith(")")) {
      setError(
        "Special prefixes like _ and () are not allowed. Use the dropdown menu instead."
      );
      return false;
    }
    if (!/^[a-zA-Z]+$/.test(name)) {
      setError("Name can only contain letters.");
      return false;
    }
    if (Object.values(AssignedFileNames).includes(name as AssignedFileName)) {
      setError("This name is reserved and cannot be used");
      return false;
    }
    if (isNameExists(name)) {
      setError("This name is already used in this directory");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSave = () => {
    if (!validateName(newName)) {
      return;
    }

    if (newName === file.name) {
      onOpenChange(false);
      return;
    }
    onRename(newName);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "").replace(/[^a-zA-Z]/g, "");
    setNewName(value);
    validateName(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        aria-describedby="Rename a file or directory"
      >
        <DialogHeader>
          <DialogTitle>Rename {file.type}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground text-justify">
            Enter a new name for the file. Only letters are allowed. camelCase
            is recommended.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Input
              value={newName}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              autoFocus
              maxLength={32}
              aria-invalid={error ? "true" : "false"}
              className={cn(error && "border-red-500")}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!!error}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
