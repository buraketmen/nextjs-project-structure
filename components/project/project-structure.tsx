"use client";

import { StructureContent } from "./structure-content";

export function ProjectStructure() {
  return (
    <div className="h-full overflow-auto">
      <h2 className="text-lg font-semibold mb-4">Project Structure</h2>

      <StructureContent />
    </div>
  );
}
