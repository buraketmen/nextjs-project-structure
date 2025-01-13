import { FileRestrictions } from "@/lib/types/restrictions";
import { FileType } from "@/types/project";
import { apiRouteRestrictions } from "./route";
import { apiLayoutRestrictions } from "./layout";
import { apiPageRestrictions } from "./page";
import { apiDirectoryRestrictions } from "./directory";
import { apiFileRestrictions } from "./file";

const apiRestrictions: Record<FileType, FileRestrictions> = {
  route: apiRouteRestrictions,
  directory: apiDirectoryRestrictions,
  page: apiPageRestrictions,
  layout: apiLayoutRestrictions,
  file: apiFileRestrictions,
};

export default apiRestrictions;
