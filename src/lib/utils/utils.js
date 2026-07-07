import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDate as formatDisplayDate } from "./dateUtils";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
  return formatDisplayDate(dateString);
}
