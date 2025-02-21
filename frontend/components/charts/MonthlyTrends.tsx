"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchTrends } from "@/lib/api/trends"
import type { TrendsResponse } from "@/lib/types/api.types"

export function MonthlyTrends() {
  const [trendsData, setTrendsData] = useState<TrendsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadTrendsData() {
      try {
        const data = await fetchTrends()
        setTrendsData(data)
      } catch (error) {
        console.error("Failed to load trends data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTrendsData()
  }, [])

  if (isLoading) {
    return (
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Month-over-Month Scam Trends</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          Loading trends data...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Month-over-Month Scam Trends ({trendsData?.year})</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trendsData?.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              stroke="#888"
              tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
            <YAxis 
              stroke="#888"
              tickFormatter={(value) => `₹${(value / 1000000000).toFixed(1)}B`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #f0f0f0" }}
              formatter={(value: number) => [`₹${(value / 1000000000).toFixed(1)}B`, "Amount"]}
            />
            <Bar 
              dataKey="totalAmount" 
              fill="#8884d8"
              name="Total Amount"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}