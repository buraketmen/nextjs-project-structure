import { FileTypes, RouteTypes } from "@/types/project";
import { hasPrivateRouter, hasApiRoute } from "@/lib/utils";
import {
  FileRestrictions,
  OutputProps,
  ShowInDropdownProps,
} from "@/lib/types/restrictions";

export const apiRouteRestrictions: FileRestrictions = {
  showInDropdown: (props: ShowInDropdownProps): boolean => {
    const { parent, fileStructure } = props;
    if (!hasApiRoute(parent, fileStructure)) {
      return false;
    }

    if (parent?.children?.some((child) => child.type === FileTypes.route)) {
      return false;
    }

    if (!parent?.routeType) {
      return true;
    }

    // If has private route parent, dont show (recursive)
    if (hasPrivateRouter(parent, fileStructure)) {
      return false;
    }

    switch (parent?.routeType) {
      case RouteTypes.group:
      case RouteTypes.private:
        return false;
      default:
        return true;
    }
  },
  canAdd: (): OutputProps => {
    // Already checked for all the restrictions in the showInDropdown function
    // No need to manupilate the file or fileStructure
    return { allowed: true };
  },
  canUpdate: (): OutputProps => {
    return {
      allowed: false,
      message: "API route handlers (route.ts) cannot be renamed",
    };
  },
  canDelete: (): OutputProps => {
    return { allowed: true };
  },
};
