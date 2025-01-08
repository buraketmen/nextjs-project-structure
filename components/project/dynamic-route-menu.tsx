import { ProjectFile } from "@/lib/types";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { useProject } from "@/context/project-context";

interface DynamicRouteMenuProps {
  file: ProjectFile;
  onUpdateFile: (updates: Partial<ProjectFile>) => void;
  setIsDropdownOpen: (open: boolean) => void;
}

export function DynamicRouteMenu({
  file,
  onUpdateFile,
  setIsDropdownOpen,
}: DynamicRouteMenuProps) {
  const { projectStructure, findParentFile } = useProject();
  const isApiRoot = file.name === "api";

  // Check if this file is under the API directory
  const hasApiParent = (currentFile: ProjectFile): boolean => {
    const parent = findParentFile(projectStructure, currentFile);
    if (!parent) return false;
    if (parent.name === "api") return true;
    return hasApiParent(parent);
  };

  const isApiDirectory = hasApiParent(file);

  // Don't show dynamic options for API root or non-directories
  if (file.type !== "directory" || isApiRoot) return null;

  // For API directories, only allow normal dynamic routes
  const handleMakeDynamic = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (file.isDynamic) {
      onUpdateFile({
        isDynamic: false,
        dynamicRouteType: null,
        name: "new-folder",
      });
      setIsDropdownOpen(false);
    } else {
      onUpdateFile({
        isDynamic: true,
        dynamicRouteType: "normal",
        name: isApiDirectory ? "[id]" : "[slug]",
      });
    }
  };

  return (
    <>
      <DropdownMenuItem onClick={handleMakeDynamic}>
        <Menu size={16} className="mr-2" />
        {file.isDynamic ? "Make Static" : "Make Dynamic"}
      </DropdownMenuItem>
      {file.isDynamic && !isApiDirectory && (
        <>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onUpdateFile({
                dynamicRouteType: "normal",
                name: "[slug]",
              });
            }}
          >
            <span className="ml-6">Normal Route [slug]</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onUpdateFile({
                dynamicRouteType: "catch-all",
                name: "[...slug]",
              });
              if (file.children?.some((child) => child.type === "directory")) {
                console.log(
                  "Converting to catch-all route. All subdirectories will be removed."
                );
              }
            }}
          >
            <span className="ml-6">Catch-all Route [...slug]</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onUpdateFile({
                dynamicRouteType: "optional-catch-all",
                name: "[[...slug]]",
              });
              if (file.children?.some((child) => child.type === "directory")) {
                console.log(
                  "Converting to optional catch-all route. All subdirectories will be removed."
                );
              }
            }}
          >
            <span className="ml-6">Optional Catch-all [[...slug]]</span>
          </DropdownMenuItem>
        </>
      )}
      {file.isDynamic && isApiDirectory && (
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onUpdateFile({
              dynamicRouteType: "normal",
              name: "[id]",
            });
          }}
        >
          <span className="ml-6">Dynamic Route [id]</span>
        </DropdownMenuItem>
      )}
    </>
  );
}
