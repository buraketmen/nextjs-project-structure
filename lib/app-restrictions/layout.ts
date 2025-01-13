import { FileTypes, RouteTypes } from "@/types/project";
import { hasPrivateRouter, hasApiRoute } from "@/lib/utils";

import {
  FileRestrictions,
  InputProps,
  OutputProps,
  ShowInDropdownProps,
} from "@/lib/types/restrictions";

export const appLayoutRestrictions: FileRestrictions = {
  showInDropdown: (props: ShowInDropdownProps): boolean => {
    const { parent, fileStructure } = props;
    if (hasApiRoute(parent, fileStructure)) {
      return false;
    }

    if (parent?.children?.some((child) => child.type === FileTypes.layout)) {
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
      default:
        return false;
    }
  },

  canAdd: (): OutputProps => {
    // Already checked for all the restrictions in the showInDropdown function
    // No need to manupilate the file or fileStructure
    return { allowed: true };
  },

  canUpdate: (props: InputProps): OutputProps => {
    return { allowed: true, asset: { file: { ...props.updates } } };
  },

  canDelete: (): OutputProps => {
    return { allowed: true };
  },
};
