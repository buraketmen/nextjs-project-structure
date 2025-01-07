import { ProjectFile, FileType } from "@/lib/types";
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
  const isDirectory = file.type === "directory";

  const handleAddFile = (type: FileType) => {
    addFile(file.id, type);
    // Update the parent directory's isExpanded state
    updateFile(file.id, { isExpanded: true });
    setIsDropdownOpen(false);
  };

  const checkApiDirectoryRestrictions = (type: FileType): boolean => {
    // Check if this file is under the API directory
    const hasApiParent = (currentFile: ProjectFile): boolean => {
      if (currentFile.name === "api") return true;
      const parent = findParentFile(projectStructure, currentFile);
      if (!parent) return false;
      if (parent.name === "api") return true;
      return hasApiParent(parent);
    };

    const isUnderApi = hasApiParent(file);

    // If under API directory, only allow API routes and directories
    if (isUnderApi) {
      // No page or layout files under API directory
      if (type === "page" || type === "layout") {
        return false;
      }

      // For route type, check if one already exists
      if (type === "route") {
        return !file.children?.some((child) => child.type === "route");
      }
    }

    // Not under API directory, don't allow API routes
    if (type === "route" && !isUnderApi) {
      return false;
    }

    return true;
  };

  const checkPageRestrictions = (type: FileType): boolean => {
    // Handle catch-all route restrictions
    const isCatchAllRoute =
      file.dynamicRouteType === "catch-all" ||
      file.dynamicRouteType === "optional-catch-all";
    if (isCatchAllRoute) {
      // Only allow layout files in catch-all routes
      if (type === "page" || type === "directory") {
        return false;
      }
    }

    // Check for existing files of the same type
    if (type === "page" || type === "layout") {
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
            {canAddFileType("directory") && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddFile("directory");
                }}
              >
                <Plus size={16} className="mr-2" /> Add Folder
              </DropdownMenuItem>
            )}
            {canAddFileType("page") && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddFile("page");
                }}
              >
                <Plus size={16} className="mr-2" /> Add Page
              </DropdownMenuItem>
            )}
            {canAddFileType("layout") && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddFile("layout");
                }}
              >
                <Plus size={16} className="mr-2" /> Add Layout
              </DropdownMenuItem>
            )}
            {canAddFileType("route") && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddFile("route");
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
        {file.type === "layout" && (
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
