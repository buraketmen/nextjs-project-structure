"use client";

import { useProject } from "@/context/project-context";
import { ProjectFile } from "@/lib/types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight, HomeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PagesTab() {
  const { currentFile, projectStructure, isApiDirectory } = useProject();

  // Find the layout file in the same directory
  const findLayoutFile = (file: ProjectFile | null) => {
    if (!file) return null;
    const parent = findParentFile(file);
    if (!parent?.children) return null;
    return parent.children.find((child) => child.type === "layout");
  };

  // Helper to find parent file
  const findParentFile = (file: ProjectFile) => {
    const findInChildren = (
      files: ProjectFile[],
      target: ProjectFile
    ): ProjectFile | null => {
      for (const f of files) {
        if (f.children?.includes(target)) return f;
        if (f.children) {
          const found = findInChildren(f.children, target);
          if (found) return found;
        }
      }
      return null;
    };
    return findInChildren(projectStructure, file);
  };

  const layoutFile = currentFile ? findLayoutFile(currentFile) : null;

  if (!currentFile) return null;

  if (isApiDirectory(currentFile)) {
    return (
      <div className="flex items-center justify-center h-full min-h-[250px] text-muted-foreground">
        This is an API route. Please use the API tab.
      </div>
    );
  }

  const pathSegments = currentFile.endpoint?.split("/").filter(Boolean) || [];

  return (
    <div className="h-full">
      <div className="pb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <HomeIcon className="h-4 w-4" />
              <span>Home</span>
            </BreadcrumbItem>
            {pathSegments.length > 0 && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
            {pathSegments.map((segment, index) => (
              <BreadcrumbItem key={index}>
                {index === pathSegments.length - 1 ? (
                  <BreadcrumbPage>{segment}</BreadcrumbPage>
                ) : (
                  <>
                    <span>{segment}</span>
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                  </>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div
        className={cn("p-4 rounded-lg min-h-[250px] border", {
          "bg-secondary": true,
        })}
        style={
          layoutFile?.customStyles
            ? {
                backgroundColor: layoutFile.customStyles.backgroundColor,
                color: layoutFile.customStyles.textColor,
              }
            : undefined
        }
      >
        {!currentFile?.endpoint || currentFile.endpoint === "/" ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a page from the project structure
          </div>
        ) : (
          <div>Content for {currentFile.endpoint}</div>
        )}
      </div>
    </div>
  );
}
