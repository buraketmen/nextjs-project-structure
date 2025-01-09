// File type definitions for Next.js project structure
export const FileTypes = {
  directory: "directory", // Represents a folder in the project structure
  page: "page", // Next.js page component (page.tsx/jsx)
  layout: "layout", // Layout component for nested layouts (layout.tsx/jsx)
  route: "route", // API route handler (route.tsx/jsx)
  file: "file", // Regular file (non-Next.js specific)
} as const;

export type FileType = (typeof FileTypes)[keyof typeof FileTypes];

// Special directory names used in Next.js projects
export const AssignedFileNames = {
  api: "api", // API routes directory
  app: "app", // App Router directory
  public: "public", // Static assets directory
  components: "components", // React components directory
  lib: "lib", // Utility functions and shared code
  src: "src", // Optional source directory for better organization
} as const;

export type AssignedFileName =
  (typeof AssignedFileNames)[keyof typeof AssignedFileNames];

// Route types supported in Next.js 13+ App Router
export const RouteTypes = {
  static: "static", // Regular route segment (e.g., /about)
  group: "group", // Route group for organization (e.g., (marketing)/about)
  dynamic: "dynamic", // Dynamic route segment (e.g., [id])
  catchAll: "catch-all", // Catch-all route segment (e.g., [...slug])
  optionalCatchAll: "optional-catch-all", // Optional catch-all route (e.g., [[...slug]])
  private: "private", // Private folder starting with underscore (_)
  parallel: "parallel", // Parallel routes (@modal)
  interceptedSameLevel: "intercepted-same-level", // Same level interception (.)
  interceptedOneLevelAbove: "intercepted-one-level-above", // One level up interception (..)
  interceptedTwoLevelsAbove: "intercepted-two-levels-above", // Two levels up interception (...)
} as const;

export type RouteType = (typeof RouteTypes)[keyof typeof RouteTypes];

export const RouteTypeFolderNames: Record<RouteType, (name: string) => string> =
  {
    [RouteTypes.static]: (name: string) => name,
    [RouteTypes.group]: (name: string) => `(${name})`,
    [RouteTypes.dynamic]: (name: string) => `[${name}]`,
    [RouteTypes.catchAll]: (name: string) => `[...${name}]`,
    [RouteTypes.optionalCatchAll]: (name: string) => `[[...${name}]]`,
    [RouteTypes.private]: (name: string) => `_${name}`,
    [RouteTypes.parallel]: (name: string) => `@${name}`,
    [RouteTypes.interceptedSameLevel]: (name: string) => `(.)${name}`,
    [RouteTypes.interceptedOneLevelAbove]: (name: string) => `(..)${name}`,
    [RouteTypes.interceptedTwoLevelsAbove]: (name: string) => `(...)${name}`,
  };

// Project file structure interface
export interface ProjectFile {
  id: string; // Unique identifier for the file
  name: string; // File or directory name
  type: FileType; // Type of the file (from FileTypes)
  isEditable: boolean; // Whether the file can be edited
  isDeletable: boolean; // Whether the file can be deleted
  isRenameable: boolean; // Whether the file can be renamed
  endpoint: string | null; // API endpoint or route path
  children?: ProjectFile[]; // Nested files/directories
  isExpanded?: boolean; // UI state for directory expansion
  routeType: RouteType; // Type of route (from RouteTypes)
  customStyles?: {
    // Optional UI styling
    backgroundColor?: string;
    textColor?: string;
  };
}
