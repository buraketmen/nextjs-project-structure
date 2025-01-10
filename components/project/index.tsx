"use client";

import { useProject } from "@/context/project-context";
import { FileNode } from "./file-node";

function StructureContent() {
  const { projectStructure } = useProject();

  return (
    <div className="space-y-1 px-1">
      {projectStructure.map((file) => (
        <FileNode key={file.id} file={file} level={0} />
      ))}
    </div>
  );
}
export default StructureContent;
