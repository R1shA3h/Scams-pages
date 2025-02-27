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
    
    if (newDate?.from && newDate?.to) {
      setIsCalendarOpen(false)
      try {
        const startDate = format(newDate.from, "yyyy-MM-dd")
        const endDate = format(newDate.to, "yyyy-MM-dd")
        const data = await fetchDateRange(startDate, endDate)
        
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response data format')
        }

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
    <div className="w-full max-w-sm mx-auto">
      <div className={cn("grid gap-2", className)}>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground",
                "bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-sm",
                "transition-all duration-200"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Select date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0 bg-white shadow-xl rounded-xl border-gray-100" 
            align="center"
          >
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={new Date()}
              selected={date}
              onSelect={handleDateChange}
              numberOfMonths={1}
              className="bg-white rounded-lg sm:hidden"
            />
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={new Date()}
              selected={date}
              onSelect={handleDateChange}
              numberOfMonths={2}
              className="bg-white rounded-lg hidden sm:block"
            />
          </PopoverContent>
        </Popover>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-xl border border-red-100 shadow-sm">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {alertData && !error && (
        <AlertCard 
          data={alertData} 
          onClose={() => setAlertData(null)} 
        />
      )}
    </div>
  )
}

