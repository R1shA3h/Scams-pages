import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIndianNumber(num: number): string {
  const formatted = num.toLocaleString('en-IN');
  return formatted;
}

export function getIndianUnit(num: number): { value: string, unit: string } {
  if (num >= 10000000) { // 1 crore
    return { 
      value: (num / 10000000).toFixed(2), 
      unit: 'Cr' 
    };
  } else if (num >= 100000) { // 1 lakh
    return { 
      value: (num / 100000).toFixed(2), 
      unit: 'L' 
    };
  } else if (num >= 1000) { // 1 thousand
    return { 
      value: (num / 1000).toFixed(2), 
      unit: 'K' 
    };
  }
  return { 
    value: num.toString(), 
    unit: '' 
  };
}
