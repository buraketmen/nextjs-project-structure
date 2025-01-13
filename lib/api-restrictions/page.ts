import { FileRestrictions, OutputProps } from "@/lib/types/restrictions";

export const apiPageRestrictions: FileRestrictions = {
  showInDropdown: (): boolean => {
    return false;
  },

  canAdd: (): OutputProps => {
    return {
      allowed: false,
      message:
        "Page files can only be used in the app directory, not in API routes",
    };
  },
  canUpdate: (): OutputProps => {
    return {
      allowed: false,
      message: "Pages are not allowed in the API directory",
    };
  },
  canDelete: (): OutputProps => {
    return {
      allowed: false,
      message: "Pages are not allowed in the API directory",
    };
  },
};
