import { FileRestrictions } from "@/lib/types/restrictions";
import { appRouteRestrictions } from "./route";
import { appLayoutRestrictions } from "./layout";
import { appPageRestrictions } from "./page";
import { appDirectoryRestrictions } from "./directory";
import { FileType } from "@/types/project";
import { appFileRestrictions } from "./file";

const appRestrictions: Record<FileType, FileRestrictions> = {
  route: appRouteRestrictions,
  directory: appDirectoryRestrictions,
  page: appPageRestrictions,
  layout: appLayoutRestrictions,
  file: appFileRestrictions,
};

export default appRestrictions;
