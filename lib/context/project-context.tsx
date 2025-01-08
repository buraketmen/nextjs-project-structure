"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ProjectFile, FileType } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { initialStructure } from "@/context/project-data";

const DYNAMIC_ROUTE_PATTERNS = {
  optionalCatchAll: /\[\[\.\.\.(\w+)\]\]/g,
  catchAll: /\[\.\.\.(\w+)\]/g,
  dynamic: /\[(\w+)\]/g,
};

const replaceDynamicRoutePatterns = (path: string): string => {
  return path
    .replace(DYNAMIC_ROUTE_PATTERNS.optionalCatchAll, ":$1?*")
    .replace(DYNAMIC_ROUTE_PATTERNS.catchAll, ":$1*")
    .replace(DYNAMIC_ROUTE_PATTERNS.dynamic, ":$1");
};

const fileConfigs: Record<
  FileType,
  {
    name: string;
    type: FileType;
    isEditable: boolean;
    isDeletable: boolean;
    isRenameable: boolean;
    endpoint: null;
    children?: never[];
    isExpanded?: boolean;
  }
> = {
  directory: {
    name: "new-folder",
    type: "directory",
    isEditable: true,
    isDeletable: true,
    isRenameable: true,
    endpoint: null,
    children: [],
    isExpanded: true,
  },
  page: {
    name: "page.tsx",
    type: "page",
    isEditable: true,
    isDeletable: true,
    isRenameable: false,
    endpoint: null,
  },
  layout: {
    name: "layout.tsx",
    type: "layout",
    isEditable: true,
    isDeletable: true,
    isRenameable: false,
    endpoint: null,
  },
  route: {
    name: "route.ts",
    type: "route",
    isEditable: true,
    isDeletable: true,
    isRenameable: false,
    endpoint: null,
  },
  file: {
    name: "file.ts",
    type: "file",
    isEditable: true,
    isDeletable: true,
    isRenameable: true,
    endpoint: null,
  },
};

interface ProjectContextType {
  projectStructure: ProjectFile[];
  currentFile: ProjectFile | null;
  setCurrentFile: (file: ProjectFile | null) => void;
  updateProjectStructure: (newStructure: ProjectFile[]) => void;
  addFile: (parentId: string, type: FileType) => void;
  updateFile: (fileId: string, updates: Partial<ProjectFile>) => void;
  deleteFile: (fileId: string) => void;
  getFileById: (id: string) => ProjectFile | undefined;
  getFileByPath: (path: string) => ProjectFile | undefined;
  findParentFile: (
    files: ProjectFile[],
    target: ProjectFile
  ) => ProjectFile | null;
  isApiDirectory: (file: ProjectFile | null | undefined) => boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectStructure, setProjectStructure] =
    useState<ProjectFile[]>(initialStructure);
  const [currentFile, setCurrentFile] = useState<ProjectFile | null>(null);

  const findFileById = (
    files: ProjectFile[],
    id: string
  ): ProjectFile | undefined => {
    for (const file of files) {
      if (file.id === id) return file;
      if (file.children) {
        const found = findFileById(file.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const findFileByPath = (
    files: ProjectFile[],
    path: string
  ): ProjectFile | undefined => {
    const parts = path.split("/").filter(Boolean);
    let current = files.find((f) => f.name === parts[0]);

    for (let i = 1; i < parts.length && current; i++) {
      current = current.children?.find((f) => f.name === parts[i]);
    }

    return current;
  };

  const buildEndpoint = (
    file: ProjectFile,
    parentPath: string = ""
  ): string | null => {
    if (
      parentPath.includes("/components") ||
      parentPath.includes("/lib") ||
      parentPath.includes("/public")
    ) {
      return null;
    }

    // For page.tsx and layout.tsx, use parent path
    if (file.type === "page" || file.type === "layout") {
      const parts = parentPath.split("/app");
      if (parts.length > 1) {
        const path = parts[1] || "/";
        const dynamicPath = replaceDynamicRoutePatterns(path);
        return dynamicPath.replace(/\/(page|layout)\.tsx$/, "");
      }
      return "/";
    }

    // For API routes - only valid under /api directory
    if (file.type === "route") {
      const parts = parentPath.split("/app");
      if (parts.length > 1 && parts[1].startsWith("/api")) {
        const path = parts[1] || "/";
        const dynamicPath = replaceDynamicRoutePatterns(path);
        return `/api${dynamicPath.replace("/api", "")}`.replace(
          /\/route\.ts$/,
          ""
        );
      }
      return null;
    }

    // For directories under app
    if (file.type === "directory" && parentPath.includes("/app")) {
      const parts = parentPath.split("/app");
      if (parts.length > 1) {
        const path = parts[1] || "/";
        const dynamicPath = replaceDynamicRoutePatterns(path);
        return dynamicPath === "/api"
          ? dynamicPath
          : dynamicPath.replace(/^\/api\//, "/");
      }
      return "/";
    }

    return null;
  };

  const updateStructure = (
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

  // Helper function to delete file from structure
  const deleteFromStructure = (
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

  // Helper to find parent file
  const findParentFile = (
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

  const updateProjectStructure = (newStructure: ProjectFile[]) => {
    setProjectStructure(newStructure);
  };

  const addFile = (parentId: string, type: FileType) => {
    const newStructure = [...projectStructure];
    const parent = findFileById(newStructure, parentId);

    if (parent && parent.type === "directory") {
      // Calculate parent path first to check if we can add the file
      const getFullPath = (file: ProjectFile): string => {
        const parts: string[] = [file.name];
        let current = findParentFile(newStructure, file);
        while (current) {
          parts.unshift(current.name);
          current = findParentFile(newStructure, current);
        }
        return `/${parts.join("/")}`;
      };

      const parentPath = getFullPath(parent);

      // Check if parent or any ancestor is a catch-all route
      const hasParentCatchAll = (currentFile: ProjectFile): boolean => {
        if (
          currentFile.dynamicRouteType === "catch-all" ||
          currentFile.dynamicRouteType === "optional-catch-all"
        ) {
          return true;
        }
        const parentFile = findParentFile(newStructure, currentFile);
        if (!parentFile) return false;
        return hasParentCatchAll(parentFile);
      };

      // Don't allow adding any files under catch-all routes except for layout, page, and route
      if (
        hasParentCatchAll(parent) &&
        !["layout", "page", "route"].includes(type)
      ) {
        return;
      }

      // Check if we can add an API route here
      if (type === "route" && !parentPath.includes("/api")) {
        return; // Can't add API route outside of /api directory
      }

      const newFile: ProjectFile = {
        id: uuidv4(),
        ...fileConfigs[type],
      };

      // Check if we can add this file
      const children = parent.children || [];
      if (type === "page" && children.some((child) => child.type === "page"))
        return;
      if (
        type === "layout" &&
        children.some((child) => child.type === "layout")
      )
        return;

      // Generate unique name for directories
      if (type === "directory") {
        const baseName = "new-folder";
        let counter = 1;
        newFile.name = baseName;

        while (children.some((child) => child.name === newFile.name)) {
          newFile.name = `${baseName}-${counter}`;
          counter++;
        }
      }

      // Set endpoint based on file type and path
      newFile.endpoint = buildEndpoint(newFile, parentPath);

      // Only add the file if it has a valid endpoint (or is not a route)
      if (type !== "route" || newFile.endpoint !== null) {
        parent.children = [...children, newFile];
        setProjectStructure(newStructure);
      }
    }
  };

  const updateFile = (fileId: string, updates: Partial<ProjectFile>) => {
    if (
      updates.dynamicRouteType &&
      (updates.dynamicRouteType === "catch-all" ||
        updates.dynamicRouteType === "optional-catch-all")
    ) {
      const initialStructure = [...projectStructure];
      const file = findFileById(initialStructure, fileId);
      if (file && file.children) {
        // Remove all subdirectories but keep files
        file.children = file.children.filter(
          (child) => child.type !== "directory"
        );
      }
    }

    // If name is being updated, we need to recalculate endpoints
    if (updates.name) {
      const initialStructure = [...projectStructure];
      const file = findFileById(initialStructure, fileId);
      if (file) {
        // Update the file first
        const updatedStructure = updateStructure(
          initialStructure,
          fileId,
          updates
        );

        // Helper function to update endpoints recursively
        const updateEndpoints = (
          files: ProjectFile[],
          rootFiles: ProjectFile[]
        ): ProjectFile[] => {
          return files.map((file) => {
            // Calculate full path for endpoint
            const getFullPath = (f: ProjectFile): string => {
              const parts: string[] = [f.name];
              let current = findParentFile(rootFiles, f);
              while (current) {
                parts.unshift(current.name);
                current = findParentFile(rootFiles, current);
              }
              return `/${parts.join("/")}`;
            };

            const fullPath = getFullPath(file);
            const newEndpoint = buildEndpoint(file, fullPath);

            // Recursively update children if this is a directory
            if (file.children) {
              return {
                ...file,
                endpoint: newEndpoint,
                children: updateEndpoints(file.children, rootFiles),
              };
            }

            return {
              ...file,
              endpoint: newEndpoint,
            };
          });
        };

        const finalStructure = updateEndpoints(
          updatedStructure,
          updatedStructure
        );
        setProjectStructure(finalStructure);
        return;
      }
    }

    setProjectStructure(updateStructure(projectStructure, fileId, updates));
  };

  const deleteFile = (fileId: string) => {
    const newStructure = deleteFromStructure(projectStructure, fileId);
    setProjectStructure(newStructure);
  };

  const getFileById = (id: string) => {
    return findFileById(projectStructure, id);
  };

  const getFileByPath = (path: string) => {
    return findFileByPath(projectStructure, path);
  };

  const isApiDirectory = (file: ProjectFile | null | undefined): boolean => {
    if (!file) return false;
    const parent = findParentFile(projectStructure, file);
    if (!parent) return false;
    if (parent.name === "api") return true;
    return isApiDirectory(parent);
  };

  return (
    <ProjectContext.Provider
      value={{
        projectStructure,
        currentFile,
        setCurrentFile,
        updateProjectStructure,
        addFile,
        updateFile,
        deleteFile,
        getFileById,
        getFileByPath,
        findParentFile,
        isApiDirectory,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
