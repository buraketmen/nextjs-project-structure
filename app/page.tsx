"use client";

import ProjectStructure from "@/components/project";
import { BrowserView } from "@/components/browser";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import {
  OrientationProvider,
  useOrientation,
} from "@/context/orientation-context";

function HomeContent() {
  const { orientation, isHorizontal } = useOrientation();

  if (!orientation) return null;

  return (
    <main className="flex h-[100svh] overflow-hidden">
      <ResizablePanelGroup direction={orientation} className="h-full w-full">
        <ResizablePanel
          defaultSize={isHorizontal ? 25 : 50}
          minSize={isHorizontal ? 20 : 30}
          maxSize={isHorizontal ? 50 : 80}
          className={cn(
            "h-full",
            isHorizontal ? "min-w-[250px]" : "min-h-[150px]"
          )}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-1 md:mb-2 border-b p-1 md:p-2">
              <h1 className="text-md md:text-xl font-bold truncate">
                Next.js Structure
              </h1>
              <ThemeToggle />
            </div>
            <h2 className="hidden md:block text-[14px] md:text-md font-semibold mb-1 md:mb-2 px-1 md:px-2 text-muted-foreground/50">
              Project Structure
            </h2>
            <div className="flex-1 overflow-y-auto px-1 md:px-2">
              <ProjectStructure />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={isHorizontal ? 75 : 50} className="h-full">
          <div className="h-full w-full overflow-y-auto">
            <div
              className={cn("h-full", {
                "px-4 py-2": isHorizontal,
                "px-2 py-2": !isHorizontal,
              })}
            >
              <BrowserView />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}

export default function Home() {
  return (
    <OrientationProvider>
      <HomeContent />
    </OrientationProvider>
  );
}
