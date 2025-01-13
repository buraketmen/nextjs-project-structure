import { FileRestrictions, OutputProps } from "@/lib/types/restrictions";

export const appRouteRestrictions: FileRestrictions = {
  showInDropdown: (): boolean => {
    return false;
  },
  canAdd: (): OutputProps => {
    return {
      allowed: false,
      message: "Route files are not allowed outside the API directory",
    };
  },
  canUpdate: (): OutputProps => {
    return {
      allowed: false,
      message: "Route files are not allowed outside the API directory",
    };
  },
  canDelete: (): OutputProps => {
    return {
      allowed: false,
      message: "Route files are not allowed outside the API directory",
    };
  },
};
