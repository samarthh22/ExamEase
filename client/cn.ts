import { twMerge } from "tailwind-merge";

/** Preserve screen-specific overrides when shared UI utilities are composed. */
export function cn(...classes: (string | false | null | undefined)[]) {
  return twMerge(classes.filter(Boolean).join(" "));
}
