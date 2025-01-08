"use client";

import { useProject } from "@/context/project-context";
import { cn } from "@/lib/utils";
import PageBreadcrumb from "./page-breadcrumb";

export function PagesTab() {
  const { currentFile, hasApiParent, getLayoutFile } = useProject();

  if (hasApiParent(currentFile, false)) {
    return (
      <div className="flex items-center justify-center h-full min-h-[250px] text-muted-foreground">
        This is an API route. Please use the API tab.
      </div>
    );
  }

  const layoutFile = getLayoutFile(currentFile);

  return (
    <div className="h-full">
      <div className="pb-4">
        <PageBreadcrumb />
      </div>

      <div
        className={cn("p-4 rounded-lg min-h-[250px] ", {
          "bg-accent": true,
          "flex items-center justify-center": !currentFile?.endpoint,
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
        {currentFile?.endpoint ? (
          <div>Content for {currentFile.endpoint}</div>
        ) : (
          <p>Select a page from the project structure.</p>
        )}
      </div>
    </div>
  );
}
