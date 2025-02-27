import { GeoDistributionResponse } from "../types/api.types";

export async function fetchGeoDistribution(): Promise<GeoDistributionResponse> {
  try {
    const response = await fetch("https://scams-backend.vercel.app/geo-distribution");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching geo distribution:", error);
    return [];
  }
} 