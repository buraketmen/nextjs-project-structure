import { ProjectFile } from "@/types/project";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash } from "lucide-react";
import { useState } from "react";
import { useProject } from "@/context/project-context";
import FileMenuDirectory from "./file-menu-directory";
import FileMenuFile from "./file-menu-file";

interface FileMenuProps {
  file: ProjectFile;
  onRename: () => void;
  onEditStyles: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function FileMenu({
  file,
  onRename,
  onEditStyles,
  onOpenChange,
}: FileMenuProps) {
  const { deleteFile } = useProject();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsDropdownOpen(open);
    onOpenChange?.(open);
  };

  const handleRename = () => {
    handleOpenChange(false);
    setTimeout(() => {
      onRename();
    }, 0);
  };

  const handleEditStyles = () => {
    handleOpenChange(false);
    setTimeout(() => {
      onEditStyles();
    }, 0);
  };

  const handleDelete = () => {
    handleOpenChange(false);
    setTimeout(() => {
      deleteFile(file.id);
    }, 0);
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:bg-accent"
        >
          <MoreVertical size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <FileMenuDirectory
          file={file}
          onRename={handleRename}
          onClose={() => handleOpenChange(false)}
        />
        <FileMenuFile file={file} onEditStyles={handleEditStyles} />
        {file.isDeletable !== false && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="text-red-500"
          >
            <Trash size={16} /> Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
