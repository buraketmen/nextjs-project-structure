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

export const appDirectoryRestrictions: FileRestrictions = {
  showInDropdown: (props: ShowInDropdownProps): boolean => {
    const { parent, fileStructure, routeType } = props;
    if (hasApiRoute(parent, fileStructure)) {
      return false;
    }

    if (!routeType) {
      // If no route type is specified, show it. Because it's a default directory.
      return (
        parent.routeType !== RouteTypes.catchAll &&
        parent.routeType !== RouteTypes.optionalCatchAll
      );
    }

    if (parent.name === AssignedFileNames.app) {
      return false;
    }

    const isUnderPrivateRoute = hasPrivateRouter(parent, fileStructure);

    switch (parent.routeType) {
      case RouteTypes.static: {
        switch (routeType) {
          case RouteTypes.static:
            return false;
          case RouteTypes.private:
            return true;
          default:
            return !isUnderPrivateRoute;
        }
      }
      case RouteTypes.group: {
        switch (routeType) {
          case RouteTypes.group:
            return false;
          case RouteTypes.static:
            return true;
          case RouteTypes.private:
            return true;
          default:
            return !isUnderPrivateRoute;
        }
      }
      case RouteTypes.dynamic: {
        switch (routeType) {
          case RouteTypes.static:
            return true;

          case RouteTypes.private:
            return true;
          default:
            return !isUnderPrivateRoute;
        }
      }
      case RouteTypes.catchAll:
      case RouteTypes.optionalCatchAll: {
        switch (routeType) {
          case RouteTypes.static:
            return true;
          default:
            return true;
        }
      }

      case RouteTypes.private: {
        switch (routeType) {
          case RouteTypes.static:
            return true;
          case RouteTypes.private:
            return false;
          default:
            return !isUnderPrivateRoute;
        }
      }
      case RouteTypes.parallel: {
        switch (routeType) {
          case RouteTypes.static:
            return true;
          case RouteTypes.private:
            return true;
          case RouteTypes.parallel:
            return false;
          default:
            return !isUnderPrivateRoute;
        }
      }
      case RouteTypes.interceptedSameLevel: {
        switch (routeType) {
          case RouteTypes.static:
            return true;
          case RouteTypes.private:
            return true;
          default:
            return !isUnderPrivateRoute;
        }
      }
      case RouteTypes.interceptedOneLevelAbove: {
        switch (routeType) {
          case RouteTypes.static:
            return true;
          case RouteTypes.private:
            return true;
          default:
            return !isUnderPrivateRoute;
        }
      }
      case RouteTypes.interceptedTwoLevelsAbove: {
        switch (routeType) {
          case RouteTypes.static:
            return true;
          case RouteTypes.private:
            return true;
          default:
            return !isUnderPrivateRoute;
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
        file: { name },
      },
    };
  },
  canUpdate: (props: InputProps): OutputProps => {
    if (hasApiRoute(props.file, props.fileStructure)) {
      return {
        allowed: false,
        message:
          "Directory must be placed in the app directory for page routing",
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
        message:
          iteration > 0
            ? "To avoid naming conflicts, a suffix has been added to the name"
            : undefined,
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
              "You can not use dynamic router when folder has a catch-all or optional catch-all router.",
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
        if (hasSelectedFilesInDirectory(props.file, [FileTypes.page], null)) {
          return {
            allowed: false,
            message:
              "Route Groups (folders with parentheses) cannot contain Page files as they are used for organization only",
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
          hasSelectedFilesInAllLevels(
            props.file,
            [FileTypes.page, FileTypes.layout],
            false
          )
        ) {
          return {
            allowed: false,
            message:
              "You can not use private folder when folder or any sub-folder has a Page or Layout file.",
          };
        }

        if (
          hasSelectedRoutersInAllLevels(
            props.file,
            [
              RouteTypes.group,
              RouteTypes.dynamic,
              RouteTypes.catchAll,
              RouteTypes.optionalCatchAll,
              RouteTypes.parallel,
              RouteTypes.interceptedSameLevel,
              RouteTypes.interceptedOneLevelAbove,
              RouteTypes.interceptedTwoLevelsAbove,
            ],
            false
          )
        ) {
          return {
            allowed: false,
            message:
              "Private folders are not be considered by the routing system. Private, static folders and non-routing files are the only allowed in private folders.",
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
        if (
          hasSelectedRoutersInDirectory(
            props.parent,
            [
              RouteTypes.dynamic,
              RouteTypes.catchAll,
              RouteTypes.optionalCatchAll,
            ],
            props.file.id
          )
        ) {
          return {
            allowed: false,
            message:
              "You can not use catch-all router when folder has a dynamic routers including optional catch-all",
          };
        }

        if (
          hasSelectedFilesInAllLevels(props.file, [FileTypes.directory], false)
        ) {
          return {
            allowed: false,
            message:
              "You can not use catch-all router when folder or any sub-folder has a directory. They will be ignored.",
          };
        }

        return {
          allowed: true,
          asset: {
            file: { ...props.updates, name: name },
          },
        };
      }
      case RouteTypes.optionalCatchAll: {
        if (
          hasSelectedRoutersInDirectory(
            props.parent,
            [
              RouteTypes.dynamic,
              RouteTypes.catchAll,
              RouteTypes.optionalCatchAll,
            ],
            props.file.id
          )
        ) {
          return {
            allowed: false,
            message:
              "You can not use optional catch-all router when folder has a dynamic routers including catch-all",
          };
        }

        if (
          hasSelectedFilesInAllLevels(props.file, [FileTypes.directory], false)
        ) {
          return {
            allowed: false,
            message:
              "You can not use optional catch-all router when folder or any sub-folder has a directory. They will be ignored.",
          };
        }

        return {
          allowed: true,
          asset: {
            file: { ...props.updates, name: name },
          },
        };
      }
      case RouteTypes.parallel: {
        // Restrictions:
        // 1. All folders have to be parallel, everything else is not allowed
        // TODO: Implement

        if (
          hasSelectedRoutersInDirectory(
            props.parent,
            [
              RouteTypes.static,
              RouteTypes.group,
              RouteTypes.dynamic,
              RouteTypes.catchAll,
              RouteTypes.optionalCatchAll,
              RouteTypes.interceptedSameLevel,
              RouteTypes.interceptedOneLevelAbove,
              RouteTypes.interceptedTwoLevelsAbove,
            ],
            null
          )
        ) {
          return {
            allowed: false,
            message:
              "Parallel routes (@folder) must be siblings. You cannot mix parallel routes with other route types in the same segment",
          };
        }
        return {
          allowed: true,
          asset: {
            file: { ...props.updates, name: name },
          },
        };
      }
      case RouteTypes.interceptedSameLevel: {
        // TODO: Implement
        return {
          allowed: true,
          asset: {
            file: { ...props.updates, name: name },
          },
        };
      }
      case RouteTypes.interceptedOneLevelAbove: {
        // TODO: Implement
        return {
          allowed: true,
          asset: {
            file: { ...props.updates, name: name },
          },
        };
      }
      case RouteTypes.interceptedTwoLevelsAbove: {
        // TODO: Implement
        return {
          allowed: true,
          asset: {
            file: { ...props.updates, name: name },
          },
        };
      }

      default:
        return {
          allowed: false,
          message: "Invalid route type.",
        };
    }
  },
  canDelete: (): OutputProps => {
    return { allowed: true };
  },
};
