import {
  FileTypes,
  ProjectFile,
  RouteTypes,
  AssignedFileNames,
  FileType,
  RouteType,
  RouteTypeFolderNames,
} from "@/types/project";
import {
  clearFolderName,
  findParentFile,
  hasApiRoute,
  hasFilesInDirectory,
  hasFilesInAllLevels,
  hasAnyDynamicRouterInAllLevels,
  hasRouterFileInDirectory,
} from "@/lib/utils";

interface InputProps {
  file: ProjectFile;
  parent?: ProjectFile | null | undefined;
  updates?: Partial<ProjectFile> | null | undefined;
  fileStructure: ProjectFile[];
}

interface ShowInDropdownProps {
  parent: ProjectFile;
  fileStructure: ProjectFile[];
  type: FileType;
  routeType?: RouteType;
}

interface OutputProps {
  allowed: boolean;
  message?: string;
  asset?: {
    file?: Partial<ProjectFile>;
    updates?: Partial<ProjectFile>;
    fileStructure?: ProjectFile[];
    parent?: ProjectFile;
  };
}

interface FileRestrictions {
  showInDropdown: (props: ShowInDropdownProps) => boolean;
  canAdd: (props: InputProps) => OutputProps;
  canUpdate: (props: InputProps) => OutputProps;
  canDelete: (props: InputProps) => OutputProps;
}

// Helper functions
const hasRouteConflict = (
  files: ProjectFile[],
  file: ProjectFile,
  targetEndpoint: string | null
): boolean => {
  if (!targetEndpoint) return false;

  for (const f of files) {
    if (f.id !== file.id && f.endpoint === targetEndpoint) return true;
    if (f.children && hasRouteConflict(f.children, file, targetEndpoint))
      return true;
  }
  return false;
};

const hasPrivateRoute = (
  file: ProjectFile,
  fileStructure: ProjectFile[]
): boolean => {
  if (file.routeType === RouteTypes.private) return true;
  const parent = findParentFile(fileStructure, file);
  if (!parent) return false;
  return hasPrivateRoute(parent, fileStructure);
};

const hasDynamicRoute = (
  parent: ProjectFile | null | undefined,
  fileId: string
): boolean => {
  if (!parent) return false;
  return (
    parent.children?.some(
      (child) =>
        child.id !== fileId &&
        (child.routeType === RouteTypes.dynamic ||
          child.routeType === RouteTypes.catchAll ||
          child.routeType === RouteTypes.optionalCatchAll)
    ) || false
  );
};

const hasCatchAllSibling = (
  parent: ProjectFile | null | undefined
): boolean => {
  if (!parent) return false;
  return (
    parent.children?.some(
      (child) =>
        child.routeType === RouteTypes.catchAll ||
        child.routeType === RouteTypes.optionalCatchAll
    ) || false
  );
};

const hasParentCatchAll = (
  currentFile: ProjectFile,
  fileStructure: ProjectFile[]
): boolean => {
  if (
    currentFile.routeType === RouteTypes.catchAll ||
    currentFile.routeType === RouteTypes.optionalCatchAll
  ) {
    return true;
  }
  const parentFile = findParentFile(fileStructure, currentFile);
  if (!parentFile) return false;
  return hasParentCatchAll(parentFile, fileStructure);
};

const getNewFolderName = (
  parent: ProjectFile | null | undefined,
  fileId: string,
  routeType: RouteType,
  baseName: string = "newFolder"
): string => {
  const siblings = parent?.children || [];
  let counter = 0;
  let newName = RouteTypeFolderNames[routeType](clearFolderName(baseName));

  while (
    siblings.some((child) => child.id !== fileId && child.name === newName)
  ) {
    let suffix = "";
    let n = counter;

    do {
      suffix = String.fromCharCode(65 + (n % 26)) + suffix;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);

    newName = RouteTypeFolderNames[routeType](
      clearFolderName(`${baseName}${suffix}`)
    );
    counter++;
  }

  return newName;
};

export const restrictions: Record<string, Record<string, FileRestrictions>> = {
  api: {
    route: {
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
        if (hasPrivateRoute(parent, fileStructure)) {
          return false;
        }

        switch (parent?.routeType) {
          case RouteTypes.group:
            return false;
          case RouteTypes.private:
            return false;
          default:
            return true;
        }
      },
      canAdd: (props: InputProps): OutputProps => {
        // Already checked for all the restrictions in the showInDropdown function
        // No need to manupilate the file or fileStructure
        return { allowed: true };
      },
      canUpdate: (props: InputProps): OutputProps => {
        return { allowed: false, message: "Route files cannot be renamed" };
      },
      canDelete: (props: InputProps): OutputProps => {
        return { allowed: true };
      },
    },
    directory: {
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

        const isUnderPrivateRoute = hasPrivateRoute(parent, fileStructure);

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
        const newName = getNewFolderName(
          props.parent,
          props.file.id,
          props.file.routeType
        );

        return {
          allowed: true,
          asset: {
            file: { name: newName },
          },
        };
      },
      canUpdate: (props: InputProps): OutputProps => {
        if (!hasApiRoute(props.file, props.fileStructure)) {
          return {
            allowed: false,
            message: "Directory must be under the /api directory",
          };
        }

        let newName = props.updates?.name || props.file.name;
        const routeType = props.updates?.routeType;

        if (!routeType) {
          newName = getNewFolderName(
            props.parent,
            props.file.id,
            props.file.routeType,
            RouteTypeFolderNames[props.file.routeType](newName)
          );
          return {
            allowed: true,
            asset: {
              file: { ...props.updates, name: newName },
            },
          };
        }

        newName = getNewFolderName(
          props.parent,
          props.file.id,
          routeType,
          RouteTypeFolderNames[routeType](newName)
        );

        switch (routeType) {
          case RouteTypes.static:
            return {
              allowed: true,
              asset: { file: { ...props.updates, name: newName } },
            };
          case RouteTypes.dynamic: {
            if (hasRouterFileInDirectory(props.parent, RouteTypes.catchAll)) {
              return {
                allowed: false,
                message:
                  "You can not use dynamic router when folder has a catch-all router.",
              };
            }
            if (
              hasRouterFileInDirectory(
                props.parent,
                RouteTypes.optionalCatchAll
              )
            ) {
              return {
                allowed: false,
                message:
                  "You can not use dynamic router when folder has an optional catch-all router.",
              };
            }
            return {
              allowed: true,
              asset: {
                file: { ...props.updates, name: newName },
              },
            };
          }
          case RouteTypes.group: {
            if (hasFilesInDirectory(props.file, FileTypes.route)) {
              return {
                allowed: false,
                message:
                  "You can not use group router when folder has a Route file.",
              };
            }

            return {
              allowed: true,
              asset: {
                file: { ...props.updates, name: newName },
              },
            };
          }
          case RouteTypes.private: {
            if (hasFilesInAllLevels(props.parent, FileTypes.route, false)) {
              return {
                allowed: false,
                message:
                  "You can not use private router when folder or any sub-folder has a Route file.",
              };
            }
            if (hasAnyDynamicRouterInAllLevels(props.parent, true)) {
              return {
                allowed: false,
                message:
                  "You can not use private router when folder or any sub-folder has a dynamic including catch-all or optional catch-all router.",
              };
            }

            return {
              allowed: true,
              asset: {
                file: { ...props.updates, name: newName },
              },
            };
          }
          case RouteTypes.catchAll: {
            return {
              allowed: false,
              message: "You can not use catch-all router in the API directory",
            };
          }
          case RouteTypes.optionalCatchAll: {
            return {
              allowed: false,
              message:
                "You can not use optional catch-all router in the API directory",
            };
          }
          default:
            return {
              allowed: false,
              message: "Invalid route type",
            };
        }
      },
      canDelete: (props: InputProps): OutputProps => {
        return { allowed: true };
      },
    },
    page: {
      showInDropdown: (props: ShowInDropdownProps): boolean => {
        return false;
      },

      canAdd: (props: InputProps): OutputProps => {
        return {
          allowed: false,
          message: "Pages are not allowed in the API directory",
        };
      },
      canUpdate: (props: InputProps): OutputProps => {
        return {
          allowed: false,
          message: "Pages are not allowed in the API directory",
        };
      },
      canDelete: (props: InputProps): OutputProps => {
        return {
          allowed: false,
          message: "Pages are not allowed in the API directory",
        };
      },
    },
    layout: {
      showInDropdown: (props: ShowInDropdownProps): boolean => {
        return false;
      },

      canAdd: (props: InputProps): OutputProps => {
        return {
          allowed: false,
          message: "Layouts are not allowed in the API directory",
        };
      },
      canUpdate: (props: InputProps): OutputProps => {
        return {
          allowed: false,
          message: "Layouts are not allowed in the API directory",
        };
      },
      canDelete: (props: InputProps): OutputProps => {
        return {
          allowed: false,
          message: "Layouts are not allowed in the API directory",
        };
      },
    },
  },
  app: {
    route: {
      showInDropdown: (props: ShowInDropdownProps): boolean => {
        return false;
      },
      canAdd: (props: InputProps): OutputProps => {
        return {
          allowed: false,
          message: "Route files are not allowed outside the API directory",
        };
      },
      canUpdate: (props: InputProps): OutputProps => {
        return {
          allowed: false,
          message: "Route files are not allowed outside the API directory",
        };
      },
      canDelete: (props: InputProps): OutputProps => {
        return {
          allowed: false,
          message: "Route files are not allowed outside the API directory",
        };
      },
    },
    directory: {
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

        const isUnderPrivateRoute = hasPrivateRoute(parent, fileStructure);

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
                return true;
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
        const newName = getNewFolderName(
          props.parent,
          props.file.id,
          props.file.routeType
        );

        return {
          allowed: true,
          asset: {
            file: { name: newName },
          },
        };
      },

      canUpdate: (props: InputProps): OutputProps => {
        if (hasApiRoute(props.file, props.fileStructure)) {
          return {
            allowed: false,
            message: "Directory must be under the /api directory",
          };
        }

        let newName = props.updates?.name || props.file.name;
        const routeType = props.updates?.routeType;

        if (!routeType) {
          newName = getNewFolderName(
            props.parent,
            props.file.id,
            props.file.routeType,
            RouteTypeFolderNames[props.file.routeType](newName)
          );
          return {
            allowed: true,
            asset: {
              file: { ...props.updates, name: newName },
            },
          };
        }

        newName = getNewFolderName(
          props.parent,
          props.file.id,
          routeType,
          RouteTypeFolderNames[routeType](newName)
        );

        switch (routeType) {
          case RouteTypes.static:
            return {
              allowed: true,
              asset: { file: { ...props.updates, name: newName } },
            };
          case RouteTypes.dynamic: {
            if (
              hasRouterFileInDirectory(
                props.parent,
                RouteTypes.catchAll,
                props.file.id
              )
            ) {
              return {
                allowed: false,
                message:
                  "You can not use dynamic router when folder has a catch-all router.",
              };
            }
            if (
              hasRouterFileInDirectory(
                props.parent,
                RouteTypes.optionalCatchAll,
                props.file.id
              )
            ) {
              return {
                allowed: false,
                message:
                  "You can not use dynamic router when folder has an optional catch-all router.",
              };
            }
            return {
              allowed: true,
              asset: {
                file: { ...props.updates, name: newName },
              },
            };
          }
          case RouteTypes.group: {
            if (hasFilesInDirectory(props.file, FileTypes.page)) {
              return {
                allowed: false,
                message:
                  "You can not use group router when folder has a Page file.",
              };
            }

            return {
              allowed: true,
              asset: {
                file: { ...props.updates, name: newName },
              },
            };
          }
          case RouteTypes.private: {
            if (hasFilesInAllLevels(props.parent, FileTypes.page, false)) {
              return {
                allowed: false,
                message:
                  "You can not use private router when folder or any sub-folder has a Page file.",
              };
            }
            if (hasFilesInAllLevels(props.parent, FileTypes.layout, false)) {
              return {
                allowed: false,
                message:
                  "You can not use private router when folder or any sub-folder has a Layout file.",
              };
            }

            if (hasAnyDynamicRouterInAllLevels(props.parent, true)) {
              return {
                allowed: false,
                message:
                  "You can not use private router when folder or any sub-folder has a dynamic including catch-all or optional catch-all router.",
              };
            }

            return {
              allowed: true,
              asset: {
                file: { ...props.updates, name: newName },
              },
            };
          }
          case RouteTypes.catchAll: {
            if (
              hasRouterFileInDirectory(
                props.parent,
                RouteTypes.optionalCatchAll,
                props.file.id
              )
            ) {
              return {
                allowed: false,
                message:
                  "You can not use catch-all router when folder has an optional catch-all router",
              };
            }
            if (
              hasRouterFileInDirectory(
                props.parent,
                RouteTypes.dynamic,
                props.file.id
              )
            ) {
              return {
                allowed: false,
                message:
                  "You can not use catch-all router when folder has a dynamic router",
              };
            }

            return {
              allowed: true,
              asset: {
                file: { ...props.updates, name: newName },
              },
            };
          }
          case RouteTypes.optionalCatchAll: {
            if (
              hasRouterFileInDirectory(
                props.parent,
                RouteTypes.catchAll,
                props.file.id
              )
            ) {
              return {
                allowed: false,
                message:
                  "You can not use optional catch-all router when folder has a catch-all router",
              };
            }
            if (
              hasRouterFileInDirectory(
                props.parent,
                RouteTypes.dynamic,
                props.file.id
              )
            ) {
              return {
                allowed: false,
                message:
                  "You can not use optional catch-all router when folder has a dynamic router",
              };
            }

            return {
              allowed: true,
              asset: {
                file: { ...props.updates, name: newName },
              },
            };
          }
          case RouteTypes.parallel: {
            // Restrictions:
            // 1. All folders have to be parallel, everything else is not allowed
            // TODO: Implement
            if (
              hasRouterFileInDirectory(
                props.parent,
                RouteTypes.static,
                props.file.id
              )
            ) {
              return {
                allowed: false,
                message:
                  "You cannot have separate static and dynamic slots at the same route segment level. ",
              };
            }
            return {
              allowed: true,
              asset: {
                file: { ...props.updates, name: newName },
              },
            };
          }
          case RouteTypes.interceptedSameLevel: {
            // TODO: Implement
            return {
              allowed: true,
              asset: {
                file: { ...props.updates, name: newName },
              },
            };
          }
          case RouteTypes.interceptedOneLevelAbove: {
            // TODO: Implement
            return {
              allowed: true,
              asset: {
                file: { ...props.updates, name: newName },
              },
            };
          }
          case RouteTypes.interceptedTwoLevelsAbove: {
            // TODO: Implement
            return {
              allowed: true,
              asset: {
                file: { ...props.updates, name: newName },
              },
            };
          }

          default:
            return {
              allowed: false,
              message: "Invalid route type",
            };
        }
      },
      canDelete: (props: InputProps): OutputProps => {
        return { allowed: true };
      },
    },
    page: {
      showInDropdown: (props: ShowInDropdownProps): boolean => {
        const { parent, fileStructure } = props;
        if (hasApiRoute(parent, fileStructure)) {
          return false;
        }
        // Check if parent already has a page
        if (parent?.children?.some((child) => child.type === FileTypes.page)) {
          return false;
        }

        if (hasPrivateRoute(parent, fileStructure)) {
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

      canAdd: (props: InputProps): OutputProps => {
        // Already checked for all the restrictions in the showInDropdown function
        // No need to manupilate the file or fileStructure
        return { allowed: true };
      },

      canUpdate: (props: InputProps): OutputProps => {
        return { allowed: false, message: "Page files cannot be renamed" };
      },

      canDelete: (props: InputProps): OutputProps => {
        return { allowed: true };
      },
    },
    layout: {
      showInDropdown: (props: ShowInDropdownProps): boolean => {
        const { parent, fileStructure } = props;
        if (hasApiRoute(parent, fileStructure)) {
          return false;
        }

        if (
          parent?.children?.some((child) => child.type === FileTypes.layout)
        ) {
          return false;
        }

        if (hasPrivateRoute(parent, fileStructure)) {
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

      canAdd: (props: InputProps): OutputProps => {
        // Already checked for all the restrictions in the showInDropdown function
        // No need to manupilate the file or fileStructure
        return { allowed: true };
      },

      canUpdate: (props: InputProps): OutputProps => {
        return { allowed: true, asset: { file: { ...props.updates } } };
      },

      canDelete: (props: InputProps): OutputProps => {
        return { allowed: true };
      },
    },
  },
};
