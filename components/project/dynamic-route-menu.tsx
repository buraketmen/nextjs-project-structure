import {
  AssignedFileNames,
  DynamicRouteTypes,
  ProjectFile,
  FileTypes,
} from "@/lib/types";
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, SquareEqual } from "lucide-react";
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
  const { hasApiParent } = useProject();
  const isApiRoot = file.name === AssignedFileNames.api;
  const isApiDirectory = hasApiParent(file, false);

  const handleUpdate = (updates: Partial<ProjectFile>) => {
    setIsDropdownOpen(false);
    setTimeout(() => {
      onUpdateFile(updates);
    }, 150);
  };

  if (file.type !== FileTypes.directory || isApiRoot) return null;

  if (file.isDynamic) {
    return (
      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation();
          handleUpdate({
            isDynamic: false,
            dynamicRouteType: null,
            name: "new-folder",
          });
        }}
      >
        <SquareEqual size={16} />
        Make Static
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Menu size={16} />
        Make Dynamic
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="ml-3">
        {!isApiDirectory ? (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleUpdate({
                  isDynamic: true,
                  dynamicRouteType: DynamicRouteTypes.normal,
                  name: "[slug]",
                });
              }}
            >
              Normal [slug]
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleUpdate({
                  isDynamic: true,
                  dynamicRouteType: DynamicRouteTypes.catchAll,
                  name: "[...slug]",
                });
              }}
            >
              Catch-all [...slug]
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleUpdate({
                  isDynamic: true,
                  dynamicRouteType: DynamicRouteTypes.optionalCatchAll,
                  name: "[[...slug]]",
                });
              }}
            >
              Optional Catch-all [[...slug]]
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleUpdate({
                isDynamic: true,
                dynamicRouteType: DynamicRouteTypes.normal,
                name: "[id]",
              });
            }}
          >
            Dynamic Route [id]
          </DropdownMenuItem>
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
