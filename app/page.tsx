"use client";

import ProjectStructure from "@/components/project";
import { BrowserView } from "@/components/browser";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useEffect, useState, useLayoutEffect } from "react";
import { cn } from "@/lib/utils";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Home() {
  const [orientation, setOrientation] = useState<
    "horizontal" | "vertical" | null
  >(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useIsomorphicLayoutEffect(() => {
    setOrientation(window.innerWidth >= 768 ? "horizontal" : "vertical");
  }, []);

  useEffect(() => {
    if (orientation !== null) {
      setOrientation(isDesktop ? "horizontal" : "vertical");
    }
  }, [isDesktop, orientation]);

  if (orientation === null) {
    return null;
  }

  return (
    <main className="flex min-h-screen">
      <ResizablePanelGroup
        direction={orientation}
        className="min-h-screen w-full"
      >
        <ResizablePanel
          defaultSize={orientation === "horizontal" ? 25 : 40}
          minSize={orientation === "horizontal" ? 20 : 30}
          maxSize={orientation === "horizontal" ? 40 : 80}
          className={
            orientation === "horizontal" ? "min-w-[250px]" : "min-h-[200px]"
          }
        >
          <div
            className={cn(
              "h-full p-4",
              orientation === "horizontal" ? "border-r" : "border-b",
              "dark:border-gray-800"
            )}
          >
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold truncate">Next.js Structure</h1>
              <ThemeToggle />
            </div>
            <ProjectStructure />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={orientation === "horizontal" ? 75 : 60}>
          <div className="h-full p-4">
            <BrowserView />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
