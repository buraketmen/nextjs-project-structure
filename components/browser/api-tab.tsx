"use client";

import { useProject } from "@/context/project-context";

export function ApiTab() {
  const { currentFile, hasApiParent } = useProject();

  if (!hasApiParent(currentFile, false)) {
    return (
      <div className="flex items-center justify-center h-full min-h-[250px] text-muted-foreground">
        This is a page route. Please use the Pages tab.
      </div>
    );
  }

  return (
    <div className="h-full border rounded-lg p-4">
      <pre className="text-sm">
        {JSON.stringify(
          {
            path: currentFile?.endpoint,
            method: "GET",
            response: {
              status: 200,
              data: {
                message: "Example API response",
              },
            },
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}
