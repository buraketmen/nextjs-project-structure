"use client";

import { ProjectFile } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface StyleDialogProps {
  file: ProjectFile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStylesChange: (styles: ProjectFile["customStyles"]) => void;
}

export function StyleDialog({
  file,
  open,
  onOpenChange,
  onStylesChange,
}: StyleDialogProps) {
  const [backgroundColor, setBackgroundColor] = useState(
    file.customStyles?.backgroundColor || "#ffffff"
  );
  const [textColor, setTextColor] = useState(
    file.customStyles?.textColor || "#000000"
  );

  const handleSave = () => {
    onStylesChange({ backgroundColor, textColor });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="Edit Layout Styles">
        <DialogHeader>
          <DialogTitle>Edit Layout Styles</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="background" className="text-right">
              Background
            </Label>
            <Input
              id="background"
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="text" className="text-right">
              Text Color
            </Label>
            <Input
              id="text"
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div
            className="p-4 rounded"
            style={{ backgroundColor, color: textColor }}
          >
            Preview Text
          </div>
        </div>
        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Save Changes
        </button>
      </DialogContent>
    </Dialog>
  );
}
