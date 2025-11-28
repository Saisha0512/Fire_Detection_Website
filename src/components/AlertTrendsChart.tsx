import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Loader2 } from "lucide-react";

interface AlertData {
  date: string;
  fire: number;
  gas_leak: number;
  temperature: number;
  motion: number;
  total: number;
}

export const AlertTrendsChart = () => {
  const [data, setData] = useState<AlertData[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("7");
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    fetchAlertTrends();
  }, [selectedLocation, timeRange]);

  const fetchLocations = async () => {
    const { data: locationData, error } = await supabase
      .from("locations")
      .select("id, name")
      .order("name");

    if (!error && locationData) {
      setLocations(locationData);
    }
  };

  const fetchAlertTrends = async () => {
    setLoading(true);
    const days = parseInt(timeRange);
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    let query = supabase
      .from("alerts")
      .select("alert_type, timestamp, location_id")
      .gte("timestamp", startDate.toISOString())
      .lte("timestamp", endDate.toISOString())
      .order("timestamp", { ascending: true });

    if (selectedLocation !== "all") {
      query = query.eq("location_id", selectedLocation);
    }

    const { data: alertData, error } = await query;

    if (!error && alertData) {
      // Group alerts by date and type
      const groupedData: { [key: string]: AlertData } = {};

      // Initialize all dates in range with zero values
      for (let i = 0; i < days; i++) {
        const date = format(subDays(new Date(), days - i - 1), "MMM dd");
        groupedData[date] = {
          date,
          fire: 0,
          gas_leak: 0,
          temperature: 0,
          motion: 0,
          total: 0,
        };
      }

      // Count alerts by date and type
      alertData.forEach((alert) => {
        const date = format(new Date(alert.timestamp), "MMM dd");
        if (groupedData[date]) {
          const type = alert.alert_type as keyof Omit<AlertData, "date" | "total">;
          groupedData[date][type] = (groupedData[date][type] || 0) + 1;
          groupedData[date].total += 1;
        }
      });

      setData(Object.values(groupedData));
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert Trends Over Time</CardTitle>
        <CardDescription>Historical view of alerts by type and location</CardDescription>
        <div className="flex flex-wrap gap-4 mt-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={chartType} onValueChange={(value: "line" | "bar") => setChartType(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            {chartType === "line" ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="fire" 
                  stroke="#ef4444" 
                  name="Fire" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="gas_leak" 
                  stroke="#f59e0b" 
                  name="Gas Leak" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#3b82f6" 
                  name="Temperature" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="motion" 
                  stroke="#8b5cf6" 
                  name="Motion" 
                  strokeWidth={2}
                />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar 
                  dataKey="fire" 
                  fill="#ef4444"
                  name="Fire" 
                />
                <Bar 
                  dataKey="gas_leak" 
                  fill="#f59e0b"
                  name="Gas Leak" 
                />
                <Bar 
                  dataKey="temperature" 
                  fill="#3b82f6"
                  name="Temperature" 
                />
                <Bar 
                  dataKey="motion" 
                  fill="#8b5cf6"
                  name="Motion" 
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
