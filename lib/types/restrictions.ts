import { ProjectFile, FileType, RouteType } from "@/types/project";

export interface InputProps {
  file: ProjectFile;
  parent?: ProjectFile | null | undefined;
  updates?: Partial<ProjectFile> | null | undefined;
  fileStructure: ProjectFile[];
}

export interface ShowInDropdownProps {
  parent: ProjectFile;
  fileStructure: ProjectFile[];
  type: FileType;
  routeType?: RouteType;
}

export interface OutputProps {
  allowed: boolean;
  message?: string;
  asset?: {
    file?: Partial<ProjectFile>;
    updates?: Partial<ProjectFile>;
    fileStructure?: ProjectFile[];
    parent?: ProjectFile;
  };
}

export interface FileRestrictions {
  showInDropdown: (props: ShowInDropdownProps) => boolean;
  canAdd: (props: InputProps) => OutputProps;
  canUpdate: (props: InputProps) => OutputProps;
  canDelete: (props: InputProps) => OutputProps;
}
