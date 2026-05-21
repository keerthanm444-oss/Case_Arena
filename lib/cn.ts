import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Combines clsx + tailwind-merge for safe class composition */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
