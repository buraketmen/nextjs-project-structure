import {
  ProjectFile,
  FileType,
  FileTypes,
  AssignedFileNames,
  DynamicRouteTypes,
} from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Plus, Settings, Edit2, Trash } from "lucide-react";
import { useState } from "react";
import { useProject } from "@/context/project-context";
import { DynamicRouteMenu } from "./dynamic-route-menu";

interface FileMenuProps {
  file: ProjectFile;
  onRename: () => void;
  onEditStyles: () => void;
}

export function FileMenu({ file, onRename, onEditStyles }: FileMenuProps) {
  const { addFile, updateFile, deleteFile, projectStructure, findParentFile } =
    useProject();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isDirectory = file.type === FileTypes.directory;

  const handleAddFile = (type: FileType) => {
    addFile(file.id, type);
    updateFile(file.id, { isExpanded: true });
    setIsDropdownOpen(false);
  };

  const checkApiDirectoryRestrictions = (type: FileType): boolean => {
    // Check if this file is under the API directory
    const hasApiParent = (currentFile: ProjectFile): boolean => {
      if (currentFile.name === AssignedFileNames.api) return true;
      const parent = findParentFile(projectStructure, currentFile);
      if (!parent) return false;
      if (parent.name === AssignedFileNames.api) return true;
      return hasApiParent(parent);
    };

    const isUnderApi = hasApiParent(file);

    // If under API directory, only allow API routes and directories
    if (isUnderApi) {
      // No page or layout files under API directory
      if (type === FileTypes.page || type === FileTypes.layout) {
        return false;
      }

      // For route type, check if one already exists
      if (type === FileTypes.route) {
        return !file.children?.some((child) => child.type === FileTypes.route);
      }
    }

    // Not under API directory, don't allow API routes
    if (type === FileTypes.route && !isUnderApi) {
      return false;
    }

    return true;
  };

  const checkPageRestrictions = (type: FileType): boolean => {
    // Handle catch-all route restrictions
    const isCatchAllRoute =
      file.dynamicRouteType === DynamicRouteTypes.catchAll ||
      file.dynamicRouteType === DynamicRouteTypes.optionalCatchAll;
    if (isCatchAllRoute) {
      // Only allow layout files in catch-all routes
      if (type === FileTypes.page || type === FileTypes.directory) {
        return false;
      }
    }

    // Check for existing files of the same type
    if (type === FileTypes.page || type === FileTypes.layout) {
      return !file.children?.some((child) => child.type === type);
    }

    return true;
  };

  const canAddFileType = (type: FileType): boolean => {
    if (!file.children) return true;

    // First check API directory restrictions
    if (!checkApiDirectoryRestrictions(type)) {
      return false;
    }

    // Then check page-related restrictions
    if (!checkPageRestrictions(type)) {
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
        {isDirectory && (
          <>
            {canAddFileType(FileTypes.directory) && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddFile(FileTypes.directory);
                }}
              >
                <Plus size={16} className="mr-2" /> Add Folder
              </DropdownMenuItem>
            )}
            {canAddFileType(FileTypes.page) && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddFile(FileTypes.page);
                }}
              >
                <Plus size={16} className="mr-2" /> Add Page
              </DropdownMenuItem>
            )}
            {canAddFileType(FileTypes.layout) && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddFile(FileTypes.layout);
                }}
              >
                <Plus size={16} className="mr-2" /> Add Layout
              </DropdownMenuItem>
            )}
            {canAddFileType(FileTypes.route) && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddFile(FileTypes.route);
                }}
              >
                <Plus size={16} className="mr-2" /> Add API Route
              </DropdownMenuItem>
            )}
          </>
        )}
        {isDirectory && (
          <DynamicRouteMenu
            file={file}
            onUpdateFile={(updates) => updateFile(file.id, updates)}
            setIsDropdownOpen={setIsDropdownOpen}
          />
        )}
        {file.type === FileTypes.layout && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEditStyles();
              setIsDropdownOpen(false);
            }}
          >
            <Settings size={16} className="mr-2" /> Edit Styles
          </DropdownMenuItem>
        )}
        {canShowRename && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onRename();
            }}
          >
            <Edit2 size={16} className="mr-2" /> Rename
          </DropdownMenuItem>
        )}
        {file.isDeletable !== false && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              deleteFile(file.id);
              setIsDropdownOpen(false);
            }}
            className="text-red-500"
          >
            <Trash size={16} className="mr-2" /> Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
