import { ProjectFile } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

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
  const [newName, setNewName] = useState(file.name);

  // Reset name when dialog opens
  useEffect(() => {
    if (open) {
      setNewName(file.name);
    }
  }, [open, file.name]);

  const handleSave = () => {
    if (newName.trim() === "") {
      setNewName(file.name);
      onOpenChange(false);
      return;
    }

    if (newName === file.name) {
      onOpenChange(false);
      return;
    }

    onRename(newName.trim());
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        aria-describedby="Rename a file or directory"
      >
        <DialogHeader>
          <DialogTitle>Rename {file.type}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
