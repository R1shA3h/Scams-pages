import { DateRangeResponse } from "../types/api.types"
import { endpoints } from "./config"

export async function fetchDateRange(startDate: string, endDate: string): Promise<DateRangeResponse> {
  try {
    const response = await fetch(`${endpoints.dateRange}?startDate=${startDate}&endDate=${endDate}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching date range data:", error)
    throw error
  }
} 