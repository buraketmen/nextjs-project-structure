export type FileType = "directory" | "page" | "layout" | "route" | "file";

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
