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
        <div className="grid grid-cols-2 items-center py-4 gap-4">
          <div className="col-span-1 items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="background" className="w-full">
                Background
              </Label>
              <input
                id="background"
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-full max-w-8 h-8 cursor-pointer rounded-lg border-none outline-0 bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="text" className="w-full">
                Text
              </Label>
              <input
                id="text"
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full max-w-8 h-8 cursor-pointer rounded-lg border-none outline-0 bg-transparent"
              />
            </div>
          </div>
          <div className="col-span-2 items-center">
            <div
              className="p-4 rounded outline outline-1 outline-gray-300"
              style={{ backgroundColor, color: textColor }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </div>
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
