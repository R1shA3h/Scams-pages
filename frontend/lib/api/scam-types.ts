import { ScamTypesResponse } from "../types/api.types";

export async function fetchScamTypes(): Promise<ScamTypesResponse> {
  try {
    const response = await fetch("https://scams-backend.vercel.app/types");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching scam types:", error);
    throw error;
  }
} 