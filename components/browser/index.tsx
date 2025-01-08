"use client";

import { useProject } from "@/context/project-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PagesTab } from "./pages-tab";
import { ApiTab } from "./api-tab";

export function BrowserView() {
  const { currentFile, hasApiParent } = useProject();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 bg-accent rounded-lg mb-2">
        <span className="text-sm text-muted-foreground">localhost:3000</span>
        <div className="flex-1 bg-background px-3 py-1 rounded text-sm">
          {currentFile?.endpoint || "/"}
        </div>
      </div>
      <Tabs
        defaultValue={hasApiParent(currentFile, false) ? "api" : "pages"}
        className="flex-1"
      >
        <TabsList>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>
        <TabsContent value="pages" className="flex-1 py-4">
          <PagesTab />
        </TabsContent>
        <TabsContent value="api" className="flex-1 py-4">
          <ApiTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
