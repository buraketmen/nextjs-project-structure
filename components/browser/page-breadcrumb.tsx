"use client";

import React from "react";
import { useProject } from "@/context/project-context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight, HomeIcon, MoreHorizontal } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function BreadcrumbSegment({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex min-w-0">
            <span className="truncate max-w-[140px] md:max-w-[350px] inline-block">
              {text}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function PageBreadcrumb() {
  const { currentFile } = useProject();
  const maxVisibleSegments = 3;

  const pathSegments = currentFile?.endpoint?.split("/").filter(Boolean) || [];
  const showDropdown = pathSegments.length > maxVisibleSegments;

  const getVisibleSegments = () => {
    if (!showDropdown) return pathSegments;
    return [pathSegments[pathSegments.length - 1]]; // Only last segment
  };

  const getHiddenSegments = () => {
    if (!showDropdown) return [];
    return pathSegments.slice(0, -1); // All segments except last
  };

  const visibleSegments = getVisibleSegments();
  const hiddenSegments = getHiddenSegments();

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex items-center overflow-hidden">
        <BreadcrumbItem className="flex items-center flex-shrink-0">
          <HomeIcon className="h-4 w-4 flex-shrink-0" />
          <span>Home</span>
        </BreadcrumbItem>

        {showDropdown && (
          <>
            <BreadcrumbSeparator className="flex-shrink-0">
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem className="flex items-center min-w-0 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 px-1 py-0.5 rounded-sm hover:bg-accent">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="text-xs text-muted-foreground">
                    {hiddenSegments.length} more
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  {hiddenSegments.map((segment, idx) => (
                    <DropdownMenuItem key={idx} className="justify-center">
                      {segment}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </>
        )}

        {visibleSegments.map((segment, index) => (
          <React.Fragment key={index}>
            <BreadcrumbSeparator className="flex-shrink-0">
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem className="flex items-center min-w-0 flex-shrink-0">
              <BreadcrumbPage className="min-w-0">
                <BreadcrumbSegment text={segment} />
              </BreadcrumbPage>
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default PageBreadcrumb;
