import { ProjectFile, FileTypes } from "@/types/project";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Settings, Trash } from "lucide-react";

interface FileMenuFileProps {
  file: ProjectFile;
  onEditStyles: () => void;
}

function FileMenuFile({ file, onEditStyles }: FileMenuFileProps) {
  if (file.type === FileTypes.directory) {
    return null;
  }

  return (
    <>
      {file.type === FileTypes.layout && (
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEditStyles();
          }}
        >
          <Settings size={16} /> Edit Styles
        </DropdownMenuItem>
      )}
    </>
  );
}

export default FileMenuFile;
