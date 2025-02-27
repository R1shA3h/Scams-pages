import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ScamTypesResponse } from "@/lib/types/api.types";
import { fetchScamTypes } from "@/lib/api/scam-types";

const COLORS = {
  investment: "#0088FE",
  trading: "#00C49F",
  forex: "#FFBB28",
  other: "#FF8042"
};

export function ScamTypesPieChart() {
  const [data, setData] = useState<ScamTypesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetchScamTypes();
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Types of Scams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-[400px] bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Types of Scams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">
            {error || 'Failed to load scam types data'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const pieData = [
    { name: "Investment", value: data.types.investment, percentage: data.percentages.investment },
    { name: "Trading", value: data.types.trading, percentage: data.percentages.trading },
    { name: "Forex", value: data.types.forex, percentage: data.percentages.forex },
    { name: "Other", value: data.types.other, percentage: data.percentages.other }
  ].filter(item => item.value > 0); // Only show types with values > 0

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Types of Scams</CardTitle>
        <p className="text-m text-gray-500">
         Monthly Total: {data.total} cases
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percentage }) => `${name} ${percentage}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} cases`, 'Count']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 