import { SummaryResponse } from "../types/api.types"

export async function fetchSummary(): Promise<SummaryResponse> {
  try {
    const response = await fetch("http://localhost:3002/summary")
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