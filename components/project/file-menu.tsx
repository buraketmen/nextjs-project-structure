import { ProjectFile, FileType, FileTypes } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Settings,
  Edit2,
  Trash,
  FolderPlus,
  FilePlus,
} from "lucide-react";
import { useState } from "react";
import { useProject } from "@/context/project-context";
import { DynamicRouteMenu } from "./dynamic-route-menu";

interface FileMenuProps {
  file: ProjectFile;
  onRename: () => void;
  onEditStyles: () => void;
}

export function FileMenu({ file, onRename, onEditStyles }: FileMenuProps) {
  const {
    addFile,
    updateFile,
    deleteFile,
    checkApiRestrictions,
    checkPageRestrictions,
  } = useProject();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isDirectory = file.type === FileTypes.directory;

  const handleAddFile = (type: FileType) => {
    setIsDropdownOpen(false);
    setTimeout(() => {
      addFile(file.id, type);
      updateFile(file.id, { isExpanded: true });
    }, 0);
  };

  const canAddFileType = (type: FileType): boolean => {
    if (!file.children) return true;

    if (!checkApiRestrictions(file, type)) {
      return false;
    }

    if (!checkPageRestrictions(file, type)) {
      return false;
    }
    return true;
  };

  // Don't show rename option for dynamic folders
  const canShowRename = file.isRenameable !== false && !file.isDynamic;

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isDirectory &&
          [
            {
              label: "New Folder",
              value: FileTypes.directory,
              icon: <FolderPlus size={16} />,
            },
            {
              label: "Add Page",
              value: FileTypes.page,
              icon: <FilePlus size={16} />,
            },
            {
              label: "Add Layout",
              value: FileTypes.layout,
              icon: <FilePlus size={16} />,
            },
            {
              label: "Add Route File",
              value: FileTypes.route,
              icon: <FilePlus size={16} />,
            },
          ].map(
            ({ label, value, icon }) =>
              canAddFileType(value) && (
                <DropdownMenuItem
                  key={value}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddFile(value);
                  }}
                >
                  {icon} {label}
                </DropdownMenuItem>
              )
          )}

        {isDirectory && (
          <DynamicRouteMenu
            file={file}
            onUpdateFile={(updates) => {
              setIsDropdownOpen(false);
              setTimeout(() => {
                updateFile(file.id, updates);
              }, 0);
            }}
            setIsDropdownOpen={setIsDropdownOpen}
          />
        )}
        {file.type === FileTypes.layout && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(false);
              setTimeout(() => {
                onEditStyles();
              }, 0);
            }}
          >
            <Settings size={16} /> Edit Styles
          </DropdownMenuItem>
        )}
        {canShowRename && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(false);
              setTimeout(() => {
                onRename();
              }, 0);
            }}
          >
            <Edit2 size={16} /> Rename
          </DropdownMenuItem>
        )}
        {file.isDeletable !== false && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(false);
              setTimeout(() => {
                deleteFile(file.id);
              }, 0);
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
