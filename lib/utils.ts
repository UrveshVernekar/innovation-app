import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeFormatDate(dateVal: Date | string | number | null | undefined, formatStr = "dd MMM yyyy, hh:mm a"): string {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    return format(d, formatStr);
  } catch {
    return "";
  }
}

export function safeFormatDistanceToNow(dateVal: Date | string | number | null | undefined, options?: { addSuffix?: boolean }): string {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    return formatDistanceToNow(d, options);
  } catch {
    return "";
  }
}
