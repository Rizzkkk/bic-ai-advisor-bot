/**
 * Utility Functions
 * This file contains general-purpose utility functions that are reusable across the application.
 * These functions are typically pure (they don't have side effects) and perform common tasks
 * like formatting data, handling common transformations, or providing helper logic.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function to merge Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
