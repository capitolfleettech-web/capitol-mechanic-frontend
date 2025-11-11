import { type ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classnames safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
