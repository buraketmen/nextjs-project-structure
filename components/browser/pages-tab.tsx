"use client";

import { useProject } from "@/context/project-context";
import { cn, findParentFile, getFullPath } from "@/lib/utils";
import PageBreadcrumb from "./page-breadcrumb";

export function PagesTab() {
  const { currentFile, hasApiParent, getLayoutFile, projectStructure } =
    useProject();

  if (hasApiParent(currentFile, false)) {
    return (
      <div className="flex items-center justify-center h-full min-h-[250px] text-muted-foreground">
        This is an API route. Please use the API tab.
      </div>
    );
  }

  const findParentLayouts = (
    file: typeof currentFile
  ): Array<{ layout: ReturnType<typeof getLayoutFile>; level: number }> => {
    if (!file) return [];

    const layouts: Array<{
      layout: ReturnType<typeof getLayoutFile>;
      level: number;
    }> = [];
    let currentLevel = 0;
    let currentParent = file;

    while (currentParent) {
      const layout = getLayoutFile(currentParent);
      if (layout) {
        layouts.unshift({ layout, level: currentLevel });
      }
      const parent = findParentFile(projectStructure, currentParent);
      if (!parent) break;
      currentParent = parent;
      currentLevel++;
    }

    return layouts;
  };

  const layouts = findParentLayouts(currentFile);

  const renderNestedLayout = (
    layouts: Array<{ layout: ReturnType<typeof getLayoutFile>; level: number }>,
    index: number,
    children: React.ReactNode,
    isContent: boolean = false
  ) => {
    if (index >= layouts.length) {
      return children;
    }

    const { layout, level } = layouts[index];
    const paddingTop = isContent ? 0 : 40;
    const layoutPath = layout ? getFullPath(layout, projectStructure) : "";

    return (
      <div
        className={cn(
          "rounded-lg relative outline outline-1 outline-foreground/20",
          {
            "bg-accent": !layout?.customStyles,
            "p-4": isContent && index === layouts.length - 1,
          }
        )}
        style={
          layout?.customStyles
            ? {
                backgroundColor: layout.customStyles.backgroundColor,
                color: layout.customStyles.textColor,
                paddingTop: `${paddingTop}px`,
              }
            : { paddingTop: `${paddingTop}px` }
        }
      >
        {!isContent && (
          <div className="absolute top-2 right-2 text-xs truncate max-w-[300px] rtl">
            {layoutPath}
          </div>
        )}
        {renderNestedLayout(layouts, index + 1, children, isContent)}
      </div>
    );
  };

  const renderContent = () => {
    const content = (
      <div className="min-h-[100px] h-full flex items-center ">
        {currentFile?.endpoint ? (
          <div>
            <span className="text-sm opacity-80">Content for</span> <br />
            <span className="text-md opacity-100">{currentFile.endpoint}</span>
          </div>
        ) : (
          <p>Select a page from the project structure.</p>
        )}
      </div>
    );

    if (layouts.length > 0) {
      return renderNestedLayout(layouts, 0, content, true);
    }

    return (
      <div
        className={cn("p-4 rounded-lg min-h-[250px] bg-accent", {
          "flex items-center justify-center": !currentFile?.endpoint,
        })}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="h-full">
      <div className="pb-4">
        <PageBreadcrumb />
      </div>

      {layouts.length > 0
        ? renderNestedLayout(layouts, 0, renderContent())
        : renderContent()}
    </div>
  );
}
