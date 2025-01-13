import {
  FileTypes,
  RouteTypes,
  AssignedFileNames,
  RouteTypeFolderNames,
} from "@/types/project";
import {
  getNewFolderName,
  hasPrivateRouter,
  hasApiRoute,
  hasSelectedRoutersInAllLevels,
  hasSelectedFilesInAllLevels,
  hasSelectedRoutersInDirectory,
  hasSelectedFilesInDirectory,
} from "@/lib/utils";
import {
  FileRestrictions,
  InputProps,
  OutputProps,
  ShowInDropdownProps,
} from "@/lib/types/restrictions";

export const apiDirectoryRestrictions: FileRestrictions = {
  showInDropdown: (props: ShowInDropdownProps): boolean => {
    const { parent, fileStructure, routeType } = props;
    if (!hasApiRoute(parent, fileStructure)) {
      return false;
    }

    if (!routeType) {
      // If no route type is specified, show it. Because it's a directory.
      return true;
    }

    if (parent.name === AssignedFileNames.api) {
      return false;
    }

    const isUnderPrivateRoute = hasPrivateRouter(parent, fileStructure);

    switch (parent.routeType) {
      case RouteTypes.static: {
        switch (routeType) {
          case RouteTypes.dynamic:
            return !isUnderPrivateRoute;
          case RouteTypes.group:
            return !isUnderPrivateRoute;
          case RouteTypes.private:
            return true;
          default:
            return false;
        }
      }
      case RouteTypes.dynamic: {
        switch (routeType) {
          case RouteTypes.static:
            return true;
          case RouteTypes.group:
            return !isUnderPrivateRoute;
          case RouteTypes.private:
            return true;
          default:
            return false;
        }
      }
      case RouteTypes.group: {
        switch (routeType) {
          case RouteTypes.static:
            return true;
          case RouteTypes.dynamic:
            return !isUnderPrivateRoute;
          case RouteTypes.private:
            return true;
          default:
            return false;
        }
      }
      case RouteTypes.private: {
        switch (routeType) {
          case RouteTypes.static:
            return true;
          case RouteTypes.group:
            return !isUnderPrivateRoute;
          case RouteTypes.dynamic:
            return !isUnderPrivateRoute;
          default:
            return false;
        }
      }
      default:
        return false;
    }
  },
  canAdd: (props: InputProps): OutputProps => {
    // Check for name conflicts and update the name if needed
    // No need to check for route type conflicts here, because it's already checked in the showInDropdown function
    const { name } = getNewFolderName(
      props.parent,
      props.file.id,
      props.file.routeType
    );

    return {
      allowed: true,
      asset: {
        file: { name: name },
      },
    };
  },
  canUpdate: (props: InputProps): OutputProps => {
    if (!hasApiRoute(props.file, props.fileStructure)) {
      return {
        allowed: false,
        message:
          "This directory must be placed under the /api directory for API routes",
      };
    }

    const newName = props.updates?.name || props.file.name;
    const routeType = props.updates?.routeType;

    if (!routeType) {
      const { name, iteration } = getNewFolderName(
        props.parent,
        props.file.id,
        props.file.routeType,
        RouteTypeFolderNames[props.file.routeType](newName)
      );
      if (iteration > 0 && name !== newName) {
        return {
          allowed: false,
          message: "A file or directory with this name already exists",
        };
      }

      return {
        allowed: true,
        asset: {
          file: { ...props.updates, name: name },
        },
      };
    }

    const { name, iteration } = getNewFolderName(
      props.parent,
      props.file.id,
      routeType,
      RouteTypeFolderNames[routeType](newName)
    );

    if (iteration > 0 && name !== newName) {
      return {
        allowed: false,
        message: "A file or directory with this name already exists",
      };
    }

    switch (routeType) {
      case RouteTypes.static:
        return {
          allowed: true,
          asset: { file: { ...props.updates, name: name } },
        };
      case RouteTypes.dynamic: {
        if (
          hasSelectedRoutersInDirectory(
            props.parent,
            [RouteTypes.catchAll, RouteTypes.optionalCatchAll],
            props.file.id
          )
        ) {
          return {
            allowed: false,
            message:
              "Dynamic routes ([param]) cannot be used alongside catch-all routes ([...param]) in the same route segment",
          };
        }
        return {
          allowed: true,
          asset: {
            file: { ...props.updates, name: name },
          },
        };
      }
      case RouteTypes.group: {
        if (
          hasSelectedFilesInDirectory(
            props.parent,
            [FileTypes.route],
            props.file.id
          )
        ) {
          return {
            allowed: false,
            message:
              "Route Groups (folders with parentheses) are for organization only and cannot contain route handlers (route.ts)",
          };
        }

        return {
          allowed: true,
          asset: {
            file: { ...props.updates, name: name },
          },
        };
      }
      case RouteTypes.private: {
        if (
          hasSelectedRoutersInAllLevels(
            props.file,
            [
              RouteTypes.dynamic,
              RouteTypes.catchAll,
              RouteTypes.optionalCatchAll,
            ],
            true
          )
        ) {
          return {
            allowed: false,
            message:
              "Private folders (_folder) cannot contain Page or Layout files as they are not part of the public routing system",
          };
        }
        if (hasSelectedFilesInAllLevels(props.file, [FileTypes.route], true)) {
          return {
            allowed: false,
            message:
              "Private folders (_folder) can only contain static routes and non-routing files. Dynamic routes, parallel routes (@folder), and intercepting routes are not allowed",
          };
        }

        return {
          allowed: true,
          asset: {
            file: { ...props.updates, name: name },
          },
        };
      }
      case RouteTypes.catchAll: {
        return {
          allowed: false,
          message:
            "Catch-all routes ([...param]) cannot be used with dynamic routes in the same route segment",
        };
      }
      case RouteTypes.optionalCatchAll: {
        return {
          allowed: false,
          message:
            "Optional catch-all routes ([[...param]]) cannot be used with dynamic routes in the same route segment",
        };
      }
      default:
        return {
          allowed: false,
          message: "This route type is not supported in the API directory",
        };
    }
  },
  canDelete: (): OutputProps => {
    return { allowed: true };
  },
};
