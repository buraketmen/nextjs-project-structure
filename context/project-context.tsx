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
  RouteTypes,
  RouteType,
  AssignedFileName,
} from "@/lib/types/project";
import { v4 as uuidv4 } from "uuid";
import { initialStructure } from "@/context/project-data";
import {
  deleteFromStructure,
  findFileById,
  findParentFile,
  getFullPath,
  replaceDynamicRoutePatterns,
  updateStructure,
} from "../lib/utils";
import { useToast } from "@/hooks/use-toast";
import apiRestrictions from "@/lib/api-restrictions";
import appRestrictions from "@/lib/app-restrictions";

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
    routeType: RouteType;
  }
> = {
  directory: {
    name: "newFolder",
    type: FileTypes.directory,
    isEditable: true,
    isDeletable: true,
    isRenameable: true,
    endpoint: null,
    children: [],
    isExpanded: true,
    routeType: RouteTypes.static,
  },
  page: {
    name: "page.tsx",
    type: FileTypes.page,
    isEditable: true,
    isDeletable: true,
    isRenameable: false,
    endpoint: null,
    routeType: RouteTypes.static,
  },
  layout: {
    name: "layout.tsx",
    type: FileTypes.layout,
    isEditable: true,
    isDeletable: true,
    isRenameable: false,
    endpoint: null,
    routeType: RouteTypes.static,
  },
  route: {
    name: "route.ts",
    type: FileTypes.route,
    isEditable: true,
    isDeletable: true,
    isRenameable: false,
    endpoint: null,
    routeType: RouteTypes.static,
  },
  file: {
    name: "file.ts",
    type: FileTypes.file,
    isEditable: true,
    isDeletable: true,
    isRenameable: true,
    endpoint: null,
    routeType: RouteTypes.static,
  },
};

interface ProjectContextType {
  projectStructure: ProjectFile[];
  currentFile: ProjectFile | null;
  setCurrentFile: (file: ProjectFile | null) => void;
  addFile: (parentId: string, type: FileType) => void;
  updateFile: (fileId: string, updates: Partial<ProjectFile>) => void;
  deleteFile: (fileId: string) => void;
  hasApiParent: (file: ProjectFile | null, checkItself: boolean) => boolean;
  getLayoutFile: (file: ProjectFile | null) => ProjectFile | null;
  getPageFile: (file: ProjectFile | null) => ProjectFile | null;
  showInDropdown: (
    parent: ProjectFile | null,
    type: FileType | null,
    routeType?: RouteType | null
  ) => boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectStructure, setProjectStructure] =
    useState<ProjectFile[]>(initialStructure);
  const [currentFile, setCurrentFile] = useState<ProjectFile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const file = findFileById(projectStructure, currentFile?.id);
    setCurrentFile(file || null);
  }, [projectStructure, currentFile]);

  const showInDropdown = (
    parent: ProjectFile | null,
    type: FileType | null,
    routeType?: RouteType | null
  ): boolean => {
    if (!parent || !type) return false;
    if (!hasApiParent(parent, true)) {
      return appRestrictions[type].showInDropdown({
        parent: parent,
        fileStructure: projectStructure,
        type,
        routeType: routeType || undefined,
      });
    }
    return apiRestrictions[type].showInDropdown({
      parent: parent,
      fileStructure: projectStructure,
      type,
      routeType: routeType || undefined,
    });
  };

  const getLayoutFile = (file: ProjectFile | null) => {
    if (!file) return null;
    const parent = findParentFile(file, projectStructure);
    if (!parent?.children) return null;
    return (
      parent.children.find(
        (child: ProjectFile) => child.type === FileTypes.layout
      ) || null
    );
  };

  const getPageFile = (file: ProjectFile | null) => {
    if (!file) return null;
    const parent = findParentFile(file, projectStructure);
    if (!parent?.children) return null;
    return (
      parent.children.find(
        (child: ProjectFile) => child.type === FileTypes.page
      ) || null
    );
  };

  const hasApiParent = (
    file: ProjectFile | null,
    checkItself: boolean = false
  ): boolean => {
    if (!file) return false;
    if (checkItself && file.name === AssignedFileNames.api) return true;
    const parent = findParentFile(file, projectStructure);
    if (!parent) return false;
    if (parent.name === AssignedFileNames.api) return true;
    return hasApiParent(parent, false);
  };

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

  const addFile = (parentId: string, type: FileType) => {
    const newStructure = [...projectStructure];
    const parent = findFileById(newStructure, parentId);
    if (!parent || parent.type !== FileTypes.directory) return;

    const parentPath = getFullPath(parent, newStructure);

    const newFile: ProjectFile = {
      id: uuidv4(),
      ...fileConfigs[type],
    };

    let result;
    if (hasApiParent(parent, true)) {
      result = apiRestrictions[type].canAdd({
        file: newFile,
        parent,
        fileStructure: projectStructure,
      });
    } else {
      result = appRestrictions[type].canAdd({
        file: newFile,
        parent,
        fileStructure: projectStructure,
      });
    }

    newFile.endpoint = buildEndpoint(newFile, parentPath);

    if (!result.allowed) {
      toast({
        title: "Restriction Error",
        description: result.message,
      });
      return null;
    }

    if (result.message) {
      toast({
        title: "Info",
        description: result.message,
      });
    }

    if (result.asset?.file) {
      Object.assign(newFile, result.asset.file);
    }

    if (newFile) {
      parent.isExpanded = true;
      parent.children = [...(parent.children || []), newFile];
      setProjectStructure(newStructure);
    }
  };

  const updateFile = (fileId: string, updates: Partial<ProjectFile>) => {
    // Check if trying to rename to a reserved name
    if (
      updates.name &&
      Object.values(AssignedFileNames).includes(
        updates.name as AssignedFileName
      )
    ) {
      toast({
        title: "Error",
        description: "Cannot rename to a reserved name",
      });
      return;
    }
    let initialStructure = [...projectStructure];
    const file = findFileById(initialStructure, fileId);
    if (!file) {
      toast({
        title: "Error",
        description: "File not found",
      });
      return;
    }
    let result;
    if (hasApiParent(file, true)) {
      result = apiRestrictions[file.type].canUpdate({
        file,
        parent: findParentFile(file, projectStructure) || undefined,
        updates,
        fileStructure: projectStructure,
      });
    } else {
      result = appRestrictions[file.type].canUpdate({
        file,
        parent: findParentFile(file, projectStructure) || undefined,
        updates,
        fileStructure: projectStructure,
      });
    }

    if (!result.allowed) {
      toast({
        title: "Error",
        description: result.message,
      });
      return;
    }

    if (result.message) {
      toast({
        title: "Info",
        description: result.message,
      });
    }

    if (result.asset?.file) {
      Object.assign(file, result.asset.file);
    }

    if (result.asset?.fileStructure) {
      initialStructure = result.asset.fileStructure;
    }

    const updatedStructure = updateStructure(initialStructure, fileId, file);
    const finalStructure = updateEndpoints(updatedStructure, updatedStructure); // Need to duplicate the structure to update the endpoints
    setProjectStructure(finalStructure);
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

    // Remove route groups from path
    const cleanPath = parentPath
      .split("/")
      .filter((segment) => !segment.match(/^\(.+\)$/))
      .join("/");

    // For page.tsx, use parent path
    if (file.type === FileTypes.page) {
      const parts = cleanPath.split("/app");
      if (parts.length > 1) {
        const path = parts[1] || "/";
        const dynamicPath = replaceDynamicRoutePatterns(path);
        return dynamicPath.replace(/\/(page|layout)\.tsx$/, "");
      }
      return "/";
    }

    // For API routes - only valid under /api directory
    if (file.type === FileTypes.route) {
      const parts = cleanPath.split("/app");
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
    if (file.type === FileTypes.directory && cleanPath.includes("/app")) {
      const parts = cleanPath.split("/app");
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

  return (
    <ProjectContext.Provider
      value={{
        projectStructure,
        currentFile,
        setCurrentFile,
        addFile,
        updateFile,
        deleteFile,
        hasApiParent,
        getLayoutFile,
        getPageFile,
        showInDropdown,
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
