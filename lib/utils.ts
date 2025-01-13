import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  AssignedFileNames,
  FileType,
  FileTypes,
  ProjectFile,
  RouteType,
  RouteTypeFolderNames,
  RouteTypes,
} from "@/types/project";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const clearFolderName = (name: string): string => {
  // Remove (, ), [, ], [[, ]], @, ., .., ...
  return name.replace(/[()\[\]{}@._]/g, "");
};

export const getNewFolderName = (
  parent: ProjectFile | null | undefined,
  fileId: string,
  routeType: RouteType,
  baseName: string = "newFolder"
): { name: string; iteration: number } => {
  const siblings = parent?.children || [];
  let counter = 0;
  let newName = RouteTypeFolderNames[routeType](clearFolderName(baseName));

  while (
    siblings.some((child) => child.id !== fileId && child.name === newName)
  ) {
    let suffix = "";
    let n = counter;

    do {
      suffix = String.fromCharCode(65 + (n % 26)) + suffix;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);

    newName = RouteTypeFolderNames[routeType](
      clearFolderName(`${baseName}${suffix}`)
    );
    counter++;
  }

  return { name: newName, iteration: counter };
};

export const findParentFile = (
  target: ProjectFile,
  files: ProjectFile[]
): ProjectFile | null => {
  for (const file of files) {
    if (file.children?.some((child) => child.id === target.id)) return file;
    if (file.children) {
      const found = findParentFile(target, file.children);
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
  let current = findParentFile(file, structure);
  while (current) {
    parts.unshift(current.name);
    current = findParentFile(current, structure);
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
  const nParent = findParentFile(currentFile, fileStructure);
  if (!nParent) return false;
  return hasApiRoute(nParent, fileStructure);
};

export const hasPrivateRouter = (
  file: ProjectFile,
  fileStructure: ProjectFile[]
): boolean => {
  if (file.routeType === RouteTypes.private) return true;
  const parent = findParentFile(file, fileStructure);
  if (!parent) return false;
  return hasPrivateRouter(parent, fileStructure);
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

export const hasSelectedRoutersInDirectory = (
  directory: ProjectFile | null | undefined,
  routers: RouteType[],
  exceptFileId: string | null | undefined = null
): boolean => {
  if (!directory) return false;
  if (!directory.children) return false;
  return directory.children.some((file) => {
    if (file.id === exceptFileId || file.type !== FileTypes.directory)
      return false;
    return routers.includes(file.routeType);
  });
};

export const hasSelectedRoutersInAllLevels = (
  directory: ProjectFile | null | undefined,
  routers: RouteType[],
  checkItself: boolean = false
): boolean => {
  if (!directory) return false;
  if (!directory.children) return false;

  if (
    checkItself &&
    directory.type === FileTypes.directory &&
    directory.routeType &&
    routers.includes(directory.routeType)
  ) {
    return true;
  }

  return directory.children.some((file) => {
    if (
      file.type === FileTypes.directory &&
      file.routeType &&
      routers.includes(file.routeType)
    ) {
      return true;
    }
    if (file.children) {
      return hasSelectedRoutersInAllLevels(file, routers, true);
    }
    return false;
  });
};

export const hasSelectedFilesInDirectory = (
  directory: ProjectFile | null | undefined,
  fileTypes: FileType[],
  exceptFileId: string | null | undefined = null
): boolean => {
  if (!directory) return false;
  if (!directory.children) return false;
  return directory.children.some((file) => {
    if (file.id === exceptFileId || file.type === FileTypes.directory)
      return false;
    return fileTypes.includes(file.type);
  });
};

export const hasSelectedFilesInAllLevels = (
  directory: ProjectFile | null | undefined,
  fileTypes: FileType[],
  checkItself: boolean = false
): boolean => {
  if (!directory) return false;
  if (!directory.children) return false;
  if (
    checkItself &&
    directory.type &&
    directory.type !== FileTypes.directory &&
    fileTypes.includes(directory.type)
  ) {
    return true;
  }

  return directory.children.some((file) => {
    if (
      file.type &&
      file.type !== FileTypes.directory &&
      fileTypes.includes(file.type)
    ) {
      return true;
    }
    if (file.children) {
      return hasSelectedFilesInAllLevels(file, fileTypes, true);
    }
    return false;
  });
};
