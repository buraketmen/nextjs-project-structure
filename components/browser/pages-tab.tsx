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

  const renderContent = () => (
    <div className="min-h-[200px] h-full flex items-center p-4">
      {currentFile?.endpoint ? (
        <div className="max-w-full">
          <span className="text-sm opacity-80 block truncate rtl">
            Content for
          </span>
          <span className="text-md opacity-100 block truncate rtl">
            {currentFile.endpoint}
          </span>
        </div>
      ) : (
        <p>Select a page from the project structure.</p>
      )}
    </div>
  );

  const renderNestedLayout = (
    layouts: Array<{ layout: ReturnType<typeof getLayoutFile>; level: number }>,
    index: number,
    children: React.ReactNode
  ) => {
    if (index >= layouts.length) {
      return children;
    }

    const { layout } = layouts[index];
    const isLastLayout = index === layouts.length - 1;
    const fullPath = layout ? getFullPath(layout, projectStructure) : "";
    const layoutPath = fullPath.replace(/^\//, "").replace(/\/$/, "");
    const showShadow = index > 0;
    const showOutline = !isLastLayout || index < layouts.length;

    return (
      <div
        className={cn("rounded-lg relative p-2", {
          "bg-accent": !layout?.customStyles,
          "outline outline-1 outline-border": showOutline,
          "shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.06)]": showShadow,
        })}
        style={{
          paddingTop: isLastLayout ? 0 : "15px",
          ...(layout?.customStyles && {
            backgroundColor: layout.customStyles.backgroundColor,
            color: layout.customStyles.textColor,
          }),
        }}
      >
        <div className="relative h-6">
          <div
            className={cn(
              "absolute right-2 top-0 text-xs truncate rtl max-w-[90%] ",
              { "top-3": isLastLayout }
            )}
          >
            {layoutPath}
          </div>
        </div>
        {isLastLayout
          ? renderContent()
          : renderNestedLayout(layouts, index + 1, children)}
      </div>
    );
  };

  return (
    <div className="h-full">
      <div className="pb-4">
        <PageBreadcrumb />
      </div>

      {layouts.length > 0 ? (
        renderNestedLayout(layouts, 0, null)
      ) : (
        <div
          className={cn("p-4 rounded-lg min-h-[250px] bg-accent", {
            "flex items-center justify-center": !currentFile?.endpoint,
          })}
        >
          {renderContent()}
        </div>
      )}
    </div>
  );
}
