import { FileTypes, RouteTypes } from "@/types/project";
import { hasPrivateRouter, hasApiRoute } from "@/lib/utils";

import {
  FileRestrictions,
  OutputProps,
  ShowInDropdownProps,
} from "@/lib/types/restrictions";

export const appPageRestrictions: FileRestrictions = {
  showInDropdown: (props: ShowInDropdownProps): boolean => {
    const { parent, fileStructure } = props;
    if (hasApiRoute(parent, fileStructure)) {
      return false;
    }
    // Check if parent already has a page
    if (parent?.children?.some((child) => child.type === FileTypes.page)) {
      return false;
    }

    if (hasPrivateRouter(parent, fileStructure)) {
      return false;
    }

    if (!parent?.routeType) {
      return true;
    }

    switch (parent?.routeType) {
      case RouteTypes.static:
        return true;
      case RouteTypes.dynamic:
        return true;
      case RouteTypes.catchAll:
        return true;
      case RouteTypes.optionalCatchAll:
        return true;
      case RouteTypes.parallel:
        return true;
      default:
        return false;
    }
  },

  canAdd: (): OutputProps => {
    // Already checked for all the restrictions in the showInDropdown function
    // No need to manupilate the file or fileStructure
    return { allowed: true };
  },

  canUpdate: (): OutputProps => {
    return { allowed: false, message: "Page files cannot be renamed" };
  },

  canDelete: (): OutputProps => {
    return { allowed: true };
  },
};
