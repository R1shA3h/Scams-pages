import { X } from "lucide-react"
import { Card, CardContent, CardHeader } from "./card"
import { Button } from "./button"
import { DateRangeResponse } from "@/lib/types/api.types"
import { formatIndianNumber} from "@/lib/utils"

interface AlertCardProps {
  data: DateRangeResponse
  onClose: () => void
}

export function AlertCard({ data, onClose }: AlertCardProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <Card className="w-[90%] max-w-2xl bg-white relative mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardHeader className="text-center pt-8">
            <h2 className="text-3xl font-bold text-red-600">Scam Alert!</h2>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6 text-center">
              <p className="text-2xl font-semibold">
                Period: {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}
              </p>
              <div className="bg-red-50 p-6 rounded-lg">
                <p className="text-4xl font-bold text-red-700 mb-2">
                ₹{formatIndianNumber(data.totalAmount)}
                </p>
                <p className="text-xl text-red-600">
                  Total Amount Scammed
                </p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <p className="text-4xl font-bold text-orange-700 mb-2">
                  {data.totalScams.toLocaleString()}
                </p>
                <p className="text-xl text-orange-600">
                  Total Cases Reported
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <button 
          onClick={() => document.getElementById('summary-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="animate-bounce bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>
    </div>
  )
} 