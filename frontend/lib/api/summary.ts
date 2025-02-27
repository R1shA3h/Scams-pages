import { SummaryResponse } from "../types/api.types"
import { endpoints } from "./config"

export async function fetchSummary(): Promise<SummaryResponse> {
  try {
    const response = await fetch(endpoints.summary)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching summary:", error)
    throw error
  }
} 