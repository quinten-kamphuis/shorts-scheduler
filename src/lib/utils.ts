import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPlatformColor(platform: string): string {
  switch (platform.toLowerCase()) {
    case "youtube":
      return "bg-red-50 text-red-700";
    case "tiktok":
      return "bg-purple-50 text-purple-700";
    case "instagram":
      return "bg-pink-50 text-pink-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}

/**
 * Generates a random 6-digit number ID.
 */
export const numid = () => Math.floor(Math.random() * 900000) + 100000;
