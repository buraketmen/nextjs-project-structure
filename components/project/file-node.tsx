"use client";

import { useProject } from "@/context/project-context";
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileTypes, ProjectFile, RouteTypes } from "@/types/project";
import { FileMenu } from "./file-menu";
import { StyleDialog } from "./style-dialog";
import { RenameDialog } from "./rename-dialog";

interface FileNodeProps {
  file: ProjectFile;
  level: number;
}

export function FileNode({ file, level }: FileNodeProps) {
  const { currentFile, setCurrentFile, updateFile } = useProject();
  const isDirectory = file.type === FileTypes.directory;
  const [isOpen, setIsOpen] = useState(file.isExpanded || false);
  const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClick = () => {
    if (isDirectory) {
      setIsOpen(!isOpen);
      updateFile(file.id, { isExpanded: !isOpen });
    } else {
      setCurrentFile(file);
    }
  };

  useEffect(() => {
    setIsOpen(file.isExpanded || false);
  }, [file.isExpanded]);

  const handleUpdateStyles = (styles: ProjectFile["customStyles"]) => {
    updateFile(file.id, { customStyles: styles });
  };

  const handleRename = (newName: string) => {
    updateFile(file.id, { name: newName });
  };

  const getIcon = useCallback(
    (file: ProjectFile) => {
      if (file.type === FileTypes.directory) {
        return isOpen ? FolderOpen : Folder;
      }
      return File;
    },
    [isOpen]
  );

  const Icon = getIcon(file);

  return (
    <div
      className={`py-0.5`}
      style={{
        marginLeft: `${Math.min(level, 6) * 6}px`,
      }}
    >
      <motion.div
        className={cn(
          "flex items-center gap-2 p-1 h-[32px] rounded hover:bg-accent cursor-pointer group truncate",
          (currentFile?.id === file.id || isMenuOpen) && "bg-accent"
        )}
        onClick={handleClick}
        whileHover={{ scale: 1.01 }}
      >
        {isDirectory && (
          <motion.div
            className="cursor-pointer flex-shrink-0"
            initial={false}
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight size={16} />
          </motion.div>
        )}
        <Icon
          size={16}
          className={cn("flex-shrink-0", {
            "text-blue-500": file.routeType === RouteTypes.group,
            "text-violet-500":
              file.routeType === RouteTypes.dynamic ||
              file.routeType === RouteTypes.catchAll ||
              file.routeType === RouteTypes.optionalCatchAll,
            "text-red-500": file.routeType === RouteTypes.private,
          })}
        />
        <span
          className={cn("truncate", {
            "text-blue-500": file.routeType === RouteTypes.group,
            "text-violet-500":
              file.routeType === RouteTypes.dynamic ||
              file.routeType === RouteTypes.catchAll ||
              file.routeType === RouteTypes.optionalCatchAll,
            "text-red-500": file.routeType === RouteTypes.private,
          })}
        >
          {file.name}
        </span>

        {file.isEditable && (
          <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
            <FileMenu
              file={file}
              onRename={() => setIsRenameDialogOpen(true)}
              onEditStyles={() => setIsStyleDialogOpen(true)}
              onOpenChange={setIsMenuOpen}
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
                if (
                  a.type === FileTypes.directory &&
                  b.type !== FileTypes.directory
                )
                  return -1;
                if (
                  a.type !== FileTypes.directory &&
                  b.type === FileTypes.directory
                )
                  return 1;

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
