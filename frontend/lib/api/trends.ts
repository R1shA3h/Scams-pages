import { TrendsResponse } from "../types/api.types"

export async function fetchTrends(): Promise<TrendsResponse> {
  try {
    const response = await fetch("https://scams-backend.vercel.app/trends")
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching trends:", error)
    throw error
  }
} 