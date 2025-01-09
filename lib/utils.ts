import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  AssignedFileNames,
  FileType,
  ProjectFile,
  RouteType,
  RouteTypes,
} from "@/types/project";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const clearFolderName = (name: string): string => {
  // Remove (, ), [, ], [[, ]], @, ., .., ...
  return name.replace(/[()\[\]{}@._]/g, "");
};

export const findParentFile = (
  files: ProjectFile[],
  target: ProjectFile
): ProjectFile | null => {
  for (const file of files) {
    if (file.children?.some((child) => child.id === target.id)) return file;
    if (file.children) {
      const found = findParentFile(file.children, target);
      if (found) return found;
    }
  }
  return null;
};

export const getFullPath = (
  file: ProjectFile,
  structure: ProjectFile[]
): string => {
  const parts: string[] = [file.name];
  let current = findParentFile(structure, file);
  while (current) {
    parts.unshift(current.name);
    current = findParentFile(structure, current);
  }
  return `/${parts.join("/")}`;
};

export const findFileById = (
  files: ProjectFile[],
  id: string | undefined | null
): ProjectFile | undefined => {
  if (!id) return undefined;
  for (const file of files) {
    if (file.id === id) return file;
    if (file.children) {
      const found = findFileById(file.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

export const updateStructure = (
  files: ProjectFile[],
  id: string,
  newFile: ProjectFile
): ProjectFile[] => {
  return files.map((file) => {
    if (file.id === id) {
      return { ...file, ...newFile };
    }
    if (file.children) {
      return {
        ...file,
        children: updateStructure(file.children, id, newFile),
      };
    }
    return file;
  });
};

export const deleteFromStructure = (
  files: ProjectFile[],
  id: string
): ProjectFile[] => {
  return files.filter((file) => {
    if (file.id === id) return false;
    if (file.children) {
      file.children = deleteFromStructure(file.children, id);
    }
    return true;
  });
};

export const hasApiRoute = (
  currentFile: ProjectFile | null | undefined,
  fileStructure: ProjectFile[]
): boolean => {
  if (!currentFile) return false;
  if (currentFile.name === AssignedFileNames.api) return true;
  const nParent = findParentFile(fileStructure, currentFile);
  if (!nParent) return false;
  return hasApiRoute(nParent, fileStructure);
};

export const replaceDynamicRoutePatterns = (path: string): string => {
  const DYNAMIC_ROUTE_PATTERNS = {
    optionalCatchAll: /\[\[\.\.\.(\w+)\]\]/g,
    catchAll: /\[\.\.\.(\w+)\]/g,
    dynamic: /\[(\w+)\]/g,
  };
  return path
    .replace(DYNAMIC_ROUTE_PATTERNS.optionalCatchAll, ":$1?*")
    .replace(DYNAMIC_ROUTE_PATTERNS.catchAll, ":$1*")
    .replace(DYNAMIC_ROUTE_PATTERNS.dynamic, ":$1");
};

export const hasFilesInDirectory = (
  directory: ProjectFile | null | undefined,
  fileType: FileType
): boolean => {
  if (!directory) return false;
  if (!directory.children) return false;

  return directory.children.some((file) => file.type === fileType);
};

export const hasFilesInAllLevels = (
  directory: ProjectFile | null | undefined,
  fileType: FileType,
  checkCurrentLevel: boolean = false
): boolean => {
  if (!directory) return false;
  if (!directory.children) return false;

  if (checkCurrentLevel && hasFilesInDirectory(directory, fileType)) {
    return true;
  }

  return directory.children.some((file) =>
    file.children ? hasFilesInAllLevels(file, fileType, true) : false
  );
};

export const hasAnyDynamicRouterInAllLevels = (
  directory: ProjectFile | null | undefined,
  checkCurrentLevel: boolean = false
): boolean => {
  return hasRouterFileInAllLevels(
    directory,
    RouteTypes.dynamic,
    checkCurrentLevel
  ) ||
    hasRouterFileInAllLevels(
      directory,
      RouteTypes.catchAll,
      checkCurrentLevel
    ) ||
    hasRouterFileInAllLevels(
      directory,
      RouteTypes.optionalCatchAll,
      checkCurrentLevel
    )
    ? true
    : false;
};

export const hasRouterFileInDirectory = (
  directory: ProjectFile | null | undefined,
  routeType: RouteType,
  exceptFileId: string | null | undefined = null
): boolean => {
  if (!directory) return false;
  if (!directory.children) return false;
  return directory.children.some((file) => {
    if (file.id === exceptFileId) return false;
    return file.routeType === routeType;
  });
};

export const hasRouterFileInAllLevels = (
  directory: ProjectFile | null | undefined,
  routeType: RouteType,
  checkCurrentLevel: boolean = false
): boolean => {
  if (!directory) return false;
  if (!directory.children) return false;
  if (checkCurrentLevel && hasRouterFileInDirectory(directory, routeType))
    return true;
  return directory.children.some((file) =>
    file.children ? hasRouterFileInAllLevels(file, routeType, true) : false
  );
};
