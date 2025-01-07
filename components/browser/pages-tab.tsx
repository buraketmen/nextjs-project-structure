"use client";

import { useProject } from "@/context/project-context";
import { ProjectFile } from "@/lib/types";

export function PagesTab() {
  const { currentFileId, getFileById, projectStructure } = useProject();
  const currentFile = currentFileId ? getFileById(currentFileId) : null;

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

  if (currentFile?.endpoint?.startsWith("/api")) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        This is an API route. Please use the API tab.
      </div>
    );
  }

  return (
    <div
      className="h-full border rounded-lg p-4"
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
        <div>
          <div className="text-sm text-muted-foreground mb-4">
            {currentFile.endpoint.split("/").filter(Boolean).join(" > ")}
          </div>
          <div>Content for {currentFile.endpoint}</div>
        </div>
      )}
    </div>
  );
}
