"use client";

import { useProject } from "@/context/project-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function UrlShower() {
  const { currentFile } = useProject();
  const endpoint = currentFile?.endpoint || "/";

  return (
    <div className="w-full flex items-center gap-2 p-2 bg-accent rounded-lg">
      <span className="text-sm text-muted-foreground">localhost:3000</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex-1 bg-background px-2 py-1 rounded text-sm truncate">
              {endpoint}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{endpoint}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export default UrlShower;
