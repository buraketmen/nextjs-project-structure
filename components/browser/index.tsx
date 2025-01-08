"use client";

import { useProject } from "@/context/project-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PagesTab } from "./pages-tab";
import { ApiTab } from "./api-tab";
import UrlShower from "./url-shower";

export function BrowserView() {
  const { currentFile, hasApiParent } = useProject();

  return (
    <div className="flex flex-col h-full">
      <div className="mb-2">
        <UrlShower />
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
