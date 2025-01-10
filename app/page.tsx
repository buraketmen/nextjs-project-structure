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
    <main className="flex min-h-screen">
      <ResizablePanelGroup
        direction={orientation}
        className="min-h-screen w-full"
      >
        <ResizablePanel
          defaultSize={isHorizontal ? 25 : 50}
          minSize={isHorizontal ? 20 : 30}
          maxSize={isHorizontal ? 50 : 80}
          className={
            isHorizontal ? "min-w-[250px] max-h-[100dvh]" : "min-h-[200px]"
          }
        >
          <div className={cn("flex flex-col h-full p-2")}>
            <div className="flex justify-between items-center mb-2 border-b-2 pb-2">
              <h1 className="text-xl font-bold truncate">Next.js Structure</h1>
              <ThemeToggle />
            </div>
            <h2 className="text-md font-semibold mb-2 text-muted-foreground/50">
              Project Structure
            </h2>
            <div className={cn("flex-1 overflow-y-auto")}>
              <ProjectStructure />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={isHorizontal ? 75 : 50}>
          <div
            className={cn(
              "px-4 py-2 overflow-y-auto",
              isHorizontal ? "h-[100dvh]" : "h-full"
            )}
          >
            <BrowserView />
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
