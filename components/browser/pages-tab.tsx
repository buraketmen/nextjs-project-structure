"use client";

import { useProject } from "@/context/project-context";
import { cn, findParentFile, getFullPath } from "@/lib/utils";
import PageBreadcrumb from "./page-breadcrumb";
import { motion } from "framer-motion";
import { FileTypes } from "@/lib/types/project";
import { FileSymlink } from "lucide-react";

export function PagesTab() {
  const {
    currentFile,
    hasApiParent,
    getLayoutFile,
    getPageFile,
    setCurrentFile,
    projectStructure,
  } = useProject();

  if (hasApiParent(currentFile, false)) {
    return (
      <div className="flex items-center justify-center h-full min-h-[250px] text-muted-foreground">
        This is an API route. Please use the API tab.
      </div>
    );
  }

  const findParentLayouts = (
    file: typeof currentFile
  ): Array<{
    layout: ReturnType<typeof getLayoutFile>;
    page: ReturnType<typeof getPageFile>;
    level: number;
  }> => {
    if (!file) return [];

    const layouts: Array<{
      layout: ReturnType<typeof getLayoutFile>;
      page: ReturnType<typeof getPageFile>;
      level: number;
    }> = [];
    let currentLevel = 0;
    let currentParent = file;

    while (currentParent) {
      const layout = getLayoutFile(currentParent);
      const page = getPageFile(currentParent);
      if (layout) {
        layouts.unshift({ layout, page, level: currentLevel });
      }
      const parent = findParentFile(currentParent, projectStructure);
      if (!parent) break;
      currentParent = parent;
      currentLevel++;
    }

    return layouts;
  };

  const layouts = findParentLayouts(currentFile);

  const renderContent = (page: ReturnType<typeof getPageFile>) => {
    const isLayout = currentFile?.type === FileTypes.layout;
    return (
      <div
        className={cn("min-h-[200px] h-full flex  p-4 w-full", {
          "justify-center": !currentFile?.endpoint,
          "items-center": !currentFile?.endpoint,
        })}
      >
        {currentFile?.endpoint ? (
          <div className="max-w-full">
            <span className="text-sm opacity-80 block truncate">
              Content for
            </span>
            <span className="text-md opacity-100 block truncate">
              {currentFile.endpoint}
            </span>
          </div>
        ) : (
          <motion.p
            whileHover={{ scale: isLayout ? 1.01 : 1 }}
            className={cn({
              "cursor-pointer": isLayout,
            })}
            onClick={(e) => {
              e.stopPropagation();
              if (page) {
                setCurrentFile(page);
              }
            }}
          >
            {currentFile?.type === FileTypes.layout
              ? "Click me or select a page from the project structure."
              : "Select a page from the project structure."}
          </motion.p>
        )}
      </div>
    );
  };

  const renderNestedLayout = (
    layouts: Array<{
      layout: ReturnType<typeof getLayoutFile>;
      page: ReturnType<typeof getPageFile>;
      level: number;
    }>,
    index: number,
    children: React.ReactNode
  ) => {
    if (index >= layouts.length) {
      return children;
    }

    const { layout, page } = layouts[index];
    const isLastLayout = index === layouts.length - 1;
    const fullPath = layout ? getFullPath(layout, projectStructure) : "";
    const layoutPath = fullPath.replace(/^\//, "").replace(/\/$/, "");
    const showShadow = index > 0;
    const showOutline = !isLastLayout || index < layouts.length;
    return (
      <motion.div
        key={index}
        layoutId={`layout-${index}`}
        className={cn("rounded-lg relative p-2", {
          "bg-accent": !layout?.customStyles,
          "outline outline-1 outline-border dark:outline-white/20": showOutline,
          "shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.10)] dark:shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.10)]":
            showShadow,
        })}
        whileTap={{ scale: showShadow ? 0.99 : 1 }}
        whileHover={{ scale: showShadow ? 0.99 : 1 }}
        transition={{ duration: 0.1, delay: 0 }}
        style={{
          paddingTop: isLastLayout ? 0 : "15px",
          ...(layout?.customStyles && {
            backgroundColor: layout.customStyles.backgroundColor,
            color: layout.customStyles.textColor,
          }),
        }}
      >
        <div className="relative h-6">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className={cn(
              "absolute right-2 top-0 text-xs truncate rtl max-w-[90%] cursor-pointer",
              { "top-3": isLastLayout }
            )}
            onClick={(e) => {
              e.stopPropagation();
              if (layout) {
                setCurrentFile(layout);
              }
            }}
          >
            <div className="flex items-center gap-1">
              {layoutPath}
              <FileSymlink size={16} className="opacity-50" />
            </div>
          </motion.div>
        </div>
        {isLastLayout
          ? renderContent(page)
          : renderNestedLayout(layouts, index + 1, children)}
      </motion.div>
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
          {renderContent(null)}
        </div>
      )}
    </div>
  );
}
