import { ApplicationData } from "@/types/application";

export function exportToJson(applications: ApplicationData[]): string {
  return JSON.stringify(applications, null, 2);
}
