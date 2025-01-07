"use client";

import { useProject } from "@/context/project-context";
import { ChevronRight, File, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectFile } from "@/lib/types";
import { FileMenu } from "./file-menu";
import { StyleDialog } from "./style-dialog";
import { RenameDialog } from "./rename-dialog";

interface FileNodeProps {
  file: ProjectFile;
  level: number;
}

export function FileNode({ file, level }: FileNodeProps) {
  const { currentFileId, setCurrentFileId, updateFile } = useProject();
  const isDirectory = file.type === "directory";
  const Icon = isDirectory ? Folder : File;
  const [isOpen, setIsOpen] = useState(file.isExpanded || false);
  const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

  const handleClick = () => {
    if (isDirectory) {
      setIsOpen(!isOpen);
      updateFile(file.id, { isExpanded: !isOpen });
    } else {
      setCurrentFileId(file.id);
    }
  };

  const handleUpdateStyles = (styles: ProjectFile["customStyles"]) => {
    updateFile(file.id, { customStyles: styles });
  };

  const handleRename = (newName: string) => {
    updateFile(file.id, { name: newName });
  };

  return (
    <div className={`pl-1 py-0.5`} style={{ marginLeft: `${level * 8}px` }}>
      <motion.div
        className={cn(
          "flex items-center gap-2 p-1 rounded hover:bg-accent cursor-pointer group",
          currentFileId === file.id && "bg-accent"
        )}
        onClick={handleClick}
        whileHover={{ scale: 1.01 }}
      >
        {isDirectory && (
          <motion.div
            className="cursor-pointer"
            initial={false}
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight size={16} />
          </motion.div>
        )}
        <Icon size={16} className={cn(file.isDynamic && "text-blue-500")} />
        <span>{file.name}</span>

        {file.isEditable && (
          <div
            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <FileMenu
              file={file}
              onRename={() => setIsRenameDialogOpen(true)}
              onEditStyles={() => setIsStyleDialogOpen(true)}
            />
          </div>
        )}
      </motion.div>
      <AnimatePresence initial={false}>
        {isDirectory && file.children && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {[...file.children]
              .sort((a, b) => {
                // First sort by type (directories first)
                if (a.type === "directory" && b.type !== "directory") return -1;
                if (a.type !== "directory" && b.type === "directory") return 1;

                // Then sort alphabetically
                return a.name.localeCompare(b.name);
              })
              .map((child) => (
                <FileNode key={child.id} file={child} level={level + 1} />
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      <StyleDialog
        file={file}
        open={isStyleDialogOpen}
        onOpenChange={setIsStyleDialogOpen}
        onStylesChange={handleUpdateStyles}
      />

      <RenameDialog
        file={file}
        open={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        onRename={handleRename}
      />
    </div>
  );
}
