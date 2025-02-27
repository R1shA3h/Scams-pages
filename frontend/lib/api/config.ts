export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://scams-backend.vercel.app';

export const endpoints = {
  summary: `${API_URL}/summary`,
  dateRange: `${API_URL}/date`,
  sources: `${API_URL}/sources`,
} as const; 