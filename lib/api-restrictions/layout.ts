import { FileRestrictions, OutputProps } from "@/lib/types/restrictions";

export const apiLayoutRestrictions: FileRestrictions = {
  showInDropdown: (): boolean => {
    return false;
  },

  canAdd: (): OutputProps => {
    return {
      allowed: false,
      message:
        "Layout handlers (layout.tsx) can only be used in the app directory, not in API routes",
    };
  },
  canUpdate: (): OutputProps => {
    return {
      allowed: false,
      message:
        "Layout handlers (layout.tsx) are not allowed in the API directory",
    };
  },
  canDelete: (): OutputProps => {
    return {
      allowed: false,
      message:
        "Layout handlers (layout.tsx) are not allowed in the API directory",
    };
  },
};
