import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ProjectFile } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  updates: Partial<ProjectFile>
): ProjectFile[] => {
  return files.map((file) => {
    if (file.id === id) {
      return { ...file, ...updates };
    }
    if (file.children) {
      return {
        ...file,
        children: updateStructure(file.children, id, updates),
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
