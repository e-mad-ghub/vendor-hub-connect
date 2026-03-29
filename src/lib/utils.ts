import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function splitParagraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}
