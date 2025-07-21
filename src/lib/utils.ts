import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// yo function le class name haru merge garcha
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 