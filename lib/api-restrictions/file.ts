import { FileRestrictions, OutputProps } from "@/lib/types/restrictions";

export const apiFileRestrictions: FileRestrictions = {
  showInDropdown: (): boolean => {
    return false;
  },
  canAdd: (): OutputProps => {
    return {
      allowed: false,
      message: "Not allowed to add files",
    };
  },
  canUpdate: (): OutputProps => {
    return {
      allowed: false,
      message: "Not allowed to update files",
    };
  },
  canDelete: (): OutputProps => {
    return {
      allowed: false,
      message: "Not allowed to delete files",
    };
  },
};
