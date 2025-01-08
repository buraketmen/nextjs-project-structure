"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  ProjectFile,
  FileType,
  AssignedFileNames,
  FileTypes,
  DynamicRouteTypes,
} from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { initialStructure } from "@/context/project-data";
import {
  deleteFromStructure,
  findFileById,
  findParentFile,
  getFullPath,
  replaceDynamicRoutePatterns,
  updateStructure,
} from "@/lib/utils";

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
    type: FileTypes.directory,
    isEditable: true,
    isDeletable: true,
    isRenameable: true,
    endpoint: null,
    children: [],
    isExpanded: true,
  },
  page: {
    name: "page.tsx",
    type: FileTypes.page,
    isEditable: true,
    isDeletable: true,
    isRenameable: false,
    endpoint: null,
  },
  layout: {
    name: "layout.tsx",
    type: FileTypes.layout,
    isEditable: true,
    isDeletable: true,
    isRenameable: false,
    endpoint: null,
  },
  route: {
    name: "route.ts",
    type: FileTypes.route,
    isEditable: true,
    isDeletable: true,
    isRenameable: false,
    endpoint: null,
  },
  file: {
    name: "file.ts",
    type: FileTypes.file,
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
  addFile: (parentId: string, type: FileType) => void;
  updateFile: (fileId: string, updates: Partial<ProjectFile>) => void;
  deleteFile: (fileId: string) => void;
  getFileByPath: (path: string) => ProjectFile | undefined;
  hasApiParent: (file: ProjectFile | null, checkItself: boolean) => boolean;
  getLayoutFile: (file: ProjectFile | null) => ProjectFile | null;
  checkApiRestrictions: (file: ProjectFile | null, type: FileType) => boolean;
  checkPageRestrictions: (file: ProjectFile | null, type: FileType) => boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectStructure, setProjectStructure] =
    useState<ProjectFile[]>(initialStructure);
  const [currentFile, setCurrentFile] = useState<ProjectFile | null>(null);

  useEffect(() => {
    const file = findFileById(projectStructure, currentFile?.id);
    setCurrentFile(file || null);
  }, [projectStructure, currentFile]);

  const getFileByPath = (path: string) => {
    const parts = path.split("/").filter(Boolean);
    let current = projectStructure.find((f) => f.name === parts[0]);

    for (let i = 1; i < parts.length && current; i++) {
      current = current.children?.find((f) => f.name === parts[i]);
    }
    return current;
  };

  const getLayoutFile = (file: ProjectFile | null) => {
    if (!file) return null;
    const parent = findParentFile(projectStructure, file);
    if (!parent?.children) return null;
    return (
      parent.children.find((child) => child.type === FileTypes.layout) || null
    );
  };

  const hasApiParent = (
    file: ProjectFile | null,
    checkItself: boolean = false
  ): boolean => {
    if (!file) return false;
    if (checkItself && file.name === AssignedFileNames.api) return true; //TODO: check if this is correct
    const parent = findParentFile(projectStructure, file);
    if (!parent) return false;
    if (parent.name === AssignedFileNames.api) return true;
    return hasApiParent(parent, false);
  };

  const addFile = (parentId: string, type: FileType) => {
    const newStructure = [...projectStructure];
    const parent = findFileById(newStructure, parentId);

    if (parent && parent.type === FileTypes.directory) {
      const parentPath = getFullPath(parent, newStructure);

      const hasParentCatchAll = (currentFile: ProjectFile): boolean => {
        if (
          currentFile.dynamicRouteType === DynamicRouteTypes.catchAll ||
          currentFile.dynamicRouteType === DynamicRouteTypes.optionalCatchAll
        ) {
          return true;
        }
        const parentFile = findParentFile(newStructure, currentFile);
        if (!parentFile) return false;
        return hasParentCatchAll(parentFile);
      };

      if (
        hasParentCatchAll(parent) &&
        type !== FileTypes.layout &&
        type !== FileTypes.page &&
        type !== FileTypes.route
      ) {
        // Dont allow adding any files under catch-all routes except for layout, page, and route
        return;
      }

      if (type === FileTypes.route && !parentPath.includes("/api")) {
        // Dont allow adding API routes outside of /api directory
        return;
      }

      const newFile: ProjectFile = {
        id: uuidv4(),
        ...fileConfigs[type],
      };

      const children = parent.children || [];
      if (
        (type === FileTypes.page || type === FileTypes.layout) &&
        children.some((child) => child.type === type)
      )
        return;

      if (type === FileTypes.directory) {
        const baseName = "new-folder";
        let counter = 1;
        newFile.name = baseName;

        while (children.some((child) => child.name === newFile.name)) {
          newFile.name = `${baseName}-${counter}`;
          counter++;
        }
      }

      newFile.endpoint = buildEndpoint(newFile, parentPath);

      if (type !== FileTypes.route || newFile.endpoint !== null) {
        parent.children = [...children, newFile];
        setProjectStructure(newStructure);
      }
    }
  };

  const updateFile = (fileId: string, updates: Partial<ProjectFile>) => {
    // If making a directory catch-all or optional catch-all, remove subdirectories
    if (
      updates.dynamicRouteType &&
      (updates.dynamicRouteType === DynamicRouteTypes.catchAll ||
        updates.dynamicRouteType === DynamicRouteTypes.optionalCatchAll)
    ) {
      const initialStructure = [...projectStructure];
      const file = findFileById(initialStructure, fileId);
      if (file && file.children) {
        file.children = file.children.filter(
          (child) => child.type !== FileTypes.directory
        );
      }
    }

    // If name is being updated or dynamic route type changes, we need to recalculate endpoints
    if (updates.name || updates.dynamicRouteType || updates.isDynamic) {
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
            const fullPath = getFullPath(file, rootFiles);
            const newEndpoint = buildEndpoint(file, fullPath);

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

    // For other updates that don't affect endpoints
    setProjectStructure(updateStructure(projectStructure, fileId, updates));
  };

  const deleteFile = (fileId: string) => {
    const newStructure = deleteFromStructure(projectStructure, fileId);
    setProjectStructure(newStructure);
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
    if (file.type === FileTypes.page || file.type === FileTypes.layout) {
      const parts = parentPath.split("/app");
      if (parts.length > 1) {
        const path = parts[1] || "/";
        const dynamicPath = replaceDynamicRoutePatterns(path);
        return dynamicPath.replace(/\/(page|layout)\.tsx$/, "");
      }
      return "/";
    }

    // For API routes - only valid under /api directory
    if (file.type === FileTypes.route) {
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
    if (file.type === FileTypes.directory && parentPath.includes("/app")) {
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

  const checkApiRestrictions = (
    file: ProjectFile | null,
    type: FileType
  ): boolean => {
    if (!file) return true;
    const isUnderApi = hasApiParent(file, true);

    if (isUnderApi) {
      if (type === FileTypes.page || type === FileTypes.layout) {
        return false;
      }

      if (type === FileTypes.route) {
        return !file.children?.some((child) => child.type === FileTypes.route);
      }
    }

    if (type === FileTypes.route && !isUnderApi) {
      return false;
    }

    return true;
  };

  const checkPageRestrictions = (
    file: ProjectFile | null,
    type: FileType
  ): boolean => {
    if (!file) return true;
    if (type === FileTypes.page || type === FileTypes.layout) {
      return !file.children?.some((child) => child.type === type);
    }
    const isCatchAllRoute =
      file.dynamicRouteType === DynamicRouteTypes.catchAll ||
      file.dynamicRouteType === DynamicRouteTypes.optionalCatchAll;
    if (isCatchAllRoute) {
      if (type === FileTypes.directory) {
        return false;
      }
    }

    return true;
  };

  return (
    <ProjectContext.Provider
      value={{
        projectStructure,
        currentFile,
        setCurrentFile,
        addFile,
        updateFile,
        deleteFile,
        getFileByPath,
        hasApiParent,
        getLayoutFile,
        checkApiRestrictions,
        checkPageRestrictions,
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
