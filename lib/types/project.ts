export const FileTypes = {
  directory: "directory",
  page: "page",
  layout: "layout",
  route: "route",
  file: "file",
} as const;

export type FileType = (typeof FileTypes)[keyof typeof FileTypes];

export const AssignedFileNames = {
  api: "api",
  app: "app",
  public: "public",
  components: "components",
  lib: "lib",
  src: "src",
} as const;

export const DynamicRouteTypes = {
  normal: "normal",
  catchAll: "catch-all",
  optionalCatchAll: "optional-catch-all",
} as const;

export type DynamicRouteType =
  | "normal"
  | "catch-all"
  | "optional-catch-all"
  | null;

export interface ProjectFile {
  id: string;
  name: string;
  type: FileType;
  isEditable: boolean;
  isDeletable: boolean;
  isRenameable: boolean;
  endpoint: string | null;
  children?: ProjectFile[];
  isExpanded?: boolean;
  isDynamic?: boolean;
  dynamicRouteType?: DynamicRouteType;
  customStyles?: {
    backgroundColor?: string;
    textColor?: string;
  };
}
