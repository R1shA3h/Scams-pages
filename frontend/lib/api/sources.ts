import { SourceItem, SourcesResponse } from "../types/api.types";
import { endpoints } from "./config"

export async function fetchSources(): Promise<{ data: SourceItem[] }> {
  try {
    const response = await fetch(endpoints.sources);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: SourcesResponse = await response.json();
    // Return the sources array from the response
    return { 
      data: data.sources || []
    };
  } catch (error) {
    console.error("Error fetching sources:", error);
    return { data: [] }; // Return empty array on error
  }
} 