import { DateRangeResponse } from "../types/api.types"

export async function fetchDateRange(startDate: string, endDate: string): Promise<DateRangeResponse> {
  try {
    const response = await fetch(`http://localhost:3002/date?startDate=${startDate}&endDate=${endDate}`)
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