import {
  ProjectFile,
  FileType,
  FileTypes,
  RouteTypes,
  RouteTypeFolderNames,
  AssignedFileNames,
} from "@/types/project";
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FolderPlus,
  FilePlus,
  Menu,
  Folder,
  Lock,
  GroupIcon,
  Edit2,
} from "lucide-react";
import { useProject } from "@/context/project-context";

interface FileMenuDirectoryProps {
  file: ProjectFile;
  onClose: () => void;
  onRename: () => void;
}

function FileMenuDirectory({
  file,
  onClose,
  onRename,
}: FileMenuDirectoryProps) {
  const { addFile, updateFile, showInDropdown, hasApiParent } = useProject();

  const handleAddFile = (type: FileType) => {
    onClose();
    setTimeout(() => {
      addFile(file.id, type);
      updateFile(file.id, { isExpanded: true });
    }, 0);
  };

  const handleUpdate = (updates: Partial<ProjectFile>) => {
    onClose();
    setTimeout(() => {
      updateFile(file.id, updates);
    }, 150);
  };

  const canAddFileType = (type: FileType): boolean => {
    if (!file.children) return true;
    return showInDropdown(file, type, null);
  };

  const isUnderApi = hasApiParent(file, true);

  if (file.type !== FileTypes.directory) {
    return null;
  }

  return (
    <>
      {[
        {
          label: "New Folder",
          value: FileTypes.directory,
          icon: <FolderPlus size={16} />,
        },
        {
          label: "Add Route File",
          value: FileTypes.route,
          icon: <FilePlus size={16} />,
        },
        ...(file.routeType == RouteTypes.group
          ? []
          : [
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
            ]),
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
      {showInDropdown(file, FileTypes.directory, RouteTypes.group) && (
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleUpdate({
              routeType: RouteTypes.group,
              name: RouteTypeFolderNames[RouteTypes.group](file.name),
            });
          }}
        >
          <GroupIcon size={16} /> Make Group
        </DropdownMenuItem>
      )}
      {showInDropdown(file, FileTypes.directory, RouteTypes.private) && (
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleUpdate({
              routeType: RouteTypes.private,
              name: RouteTypeFolderNames[RouteTypes.private](file.name),
            });
          }}
        >
          <Lock size={16} /> Make Private
        </DropdownMenuItem>
      )}

      {showInDropdown(file, FileTypes.directory, RouteTypes.static) && (
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleUpdate({
              routeType: RouteTypes.static,
              name: RouteTypeFolderNames[RouteTypes.static](file.name),
            });
          }}
        >
          <Folder size={16} /> Make Static
        </DropdownMenuItem>
      )}
      {showInDropdown(file, FileTypes.directory, RouteTypes.dynamic) && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Menu size={16} />
            Make Dynamic
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="ml-3">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleUpdate({
                  routeType: RouteTypes.dynamic,
                  name: RouteTypeFolderNames[RouteTypes.dynamic](file.name),
                });
              }}
            >
              {`Dynamic ${isUnderApi ? "[id]" : "[slug]"}`}
            </DropdownMenuItem>
            {showInDropdown(file, FileTypes.directory, RouteTypes.catchAll) && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdate({
                    routeType: RouteTypes.catchAll,
                    name: RouteTypeFolderNames[RouteTypes.catchAll](file.name),
                  });
                }}
              >
                {`Catch-all ${isUnderApi ? "[...id]" : "[...slug]"}`}
              </DropdownMenuItem>
            )}
            {showInDropdown(
              file,
              FileTypes.directory,
              RouteTypes.optionalCatchAll
            ) && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdate({
                    routeType: RouteTypes.optionalCatchAll,
                    name: RouteTypeFolderNames[RouteTypes.optionalCatchAll](
                      file.name
                    ),
                  });
                }}
              >
                {`Optional Catch-all ${
                  isUnderApi ? "[[...id]]" : "[[...slug]]"
                }`}
              </DropdownMenuItem>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )}
      {file.isRenameable !== false && (
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onRename();
          }}
        >
          <Edit2 size={16} /> Rename
        </DropdownMenuItem>
      )}
    </>
  );
}
export default FileMenuDirectory;
