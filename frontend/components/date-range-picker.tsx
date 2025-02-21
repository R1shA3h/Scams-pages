"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AlertCard } from "@/components/ui/alert-card"
import { fetchDateRange } from "@/lib/api/dateRange"
import type { DateRangeResponse } from "@/lib/types/api.types"

export function DatePickerWithRange({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>()
  const [alertData, setAlertData] = React.useState<DateRangeResponse | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleDateChange = async (newDate: DateRange | undefined) => {
    setDate(newDate)
    setError(null)
    
    // If both dates are selected, close the calendar and fetch data
    if (newDate?.from && newDate?.to) {
      setIsCalendarOpen(false) // Close the calendar
      try {
        const startDate = format(newDate.from, "yyyy-MM-dd")
        const endDate = format(newDate.to, "yyyy-MM-dd")
        const data = await fetchDateRange(startDate, endDate)
        
        // Validate the response data
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response data format')
        }

        // Ensure the data has the required properties
        const validatedData: DateRangeResponse = {
          totalScams: data.totalScams || 0,
          totalAmount: data.totalAmount || 0,
          startDate: data.startDate || startDate,
          endDate: data.endDate || endDate,
          message: data.message || 'Date range data retrieved successfully'
        }

        setAlertData(validatedData)
      } catch (error) {
        console.error("Failed to fetch date range data:", error)
        setError(error instanceof Error ? error.message : 'Failed to fetch date range data')
        setAlertData(null)
      }
    }
  }

  return (
    <>
      <div className={cn("grid gap-2", className)}>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground",
                "bg-white text-gray-900 hover:bg-gray-100",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Enter the date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={new Date()}
              selected={date}
              onSelect={handleDateChange}
              numberOfMonths={2}
              className="bg-white"
            />
          </PopoverContent>
        </Popover>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md">
          {error}
        </div>
      )}

      {alertData && !error && (
        <AlertCard 
          data={alertData} 
          onClose={() => setAlertData(null)} 
        />
      )}
    </>
  )
}

