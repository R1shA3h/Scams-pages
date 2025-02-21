import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SummaryStats } from "@/lib/types/api.types"

interface DailyStatsProps {
  data: SummaryStats
  title: string
}

export function DailyStats({ data, title }: DailyStatsProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDateRangeText = () => {
    if (data.dateRange.weekNumber) {
      return `Week ${data.dateRange.weekNumber}`;
    }
    if (data.dateRange.month) {
      return `${data.dateRange.month.toUpperCase()}`;
    }
    if (data.dateRange.year) {
      return `${data.dateRange.year}`;
    }
    return `${formatDate(data.dateRange.start)}`;
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="p-3">
        <CardTitle className="text-base flex justify-between items-center">
          <span>{title}</span>
          <span className="text-xs text-gray-500">
            {getDateRangeText()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="text-base font-bold">₹{(data.totalAmount / 10000000).toFixed(1)}Cr</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Cases</p>
              <p className="text-base font-bold">{data.totalCases}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Scam Types</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {Object.entries(data.scamsByType).map(([type, count]) => (
                count > 0 && (
                  <div key={type} className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded">
                    <span className="capitalize">{type}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                )
              ))}
            </div>
          </div>
          {data.dateRange.start !== data.dateRange.end && (
            <div className="text-[10px] text-gray-400 pt-1">
              {formatDate(data.dateRange.start)} - {formatDate(data.dateRange.end)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 