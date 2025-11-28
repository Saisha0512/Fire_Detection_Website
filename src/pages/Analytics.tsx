import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { AlertTrendsChart } from "@/components/AlertTrendsChart";

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

const Analytics = () => {
  const { toast } = useToast();
  const [rawData, setRawData] = useState<any[]>([]);
  const [alertsByType, setAlertsByType] = useState<any[]>([]);
  const [alertsByLocation, setAlertsByLocation] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
    
    const interval = setInterval(fetchAnalyticsData, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      // Fetch all alerts
      const { data: alerts, error } = await supabase
        .from("alerts")
        .select("*, locations(name)")
        .order("timestamp", { ascending: false });

      if (error) throw error;

      setRawData(alerts || []);

      // Process data for charts
      processAlertsByType(alerts || []);
      processAlertsByLocation(alerts || []);
      processMonthlyTrend(alerts || []);
    } catch (error) {
      toast({
        title: "Error fetching analytics",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const processAlertsByType = (alerts: any[]) => {
    const typeCount: { [key: string]: number } = {};
    alerts.forEach(alert => {
      typeCount[alert.alert_type] = (typeCount[alert.alert_type] || 0) + 1;
    });

    const chartData = Object.entries(typeCount).map(([type, count]) => ({
      name: type.toUpperCase(),
      value: count,
    }));

    setAlertsByType(chartData);
  };

  const processAlertsByLocation = (alerts: any[]) => {
    const locationCount: { [key: string]: number } = {};
    alerts.forEach(alert => {
      const locationName = alert.locations?.name || "Unknown";
      locationCount[locationName] = (locationCount[locationName] || 0) + 1;
    });

    const chartData = Object.entries(locationCount).map(([name, count]) => ({
      name,
      alerts: count,
    }));

    setAlertsByLocation(chartData);
  };

  const processMonthlyTrend = (alerts: any[]) => {
    const monthCount: { [key: string]: number } = {};
    alerts.forEach(alert => {
      const date = new Date(alert.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthCount[monthKey] = (monthCount[monthKey] || 0) + 1;
    });

    const chartData = Object.entries(monthCount)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month,
        alerts: count,
      }));

    setMonthlyTrend(chartData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Delhi Location - Real-time analytics and historical data</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{rawData.length}</div>
            <p className="text-sm text-muted-foreground">Total Alerts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">
              {rawData.filter(a => a.status === "active").length}
            </div>
            <p className="text-sm text-muted-foreground">Active Alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-status-normal">
              {rawData.filter(a => a.status === "resolved").length}
            </div>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-status-warning">
              {rawData.filter(a => a.severity === "critical").length}
            </div>
            <p className="text-sm text-muted-foreground">Critical Cases</p>
          </CardContent>
        </Card>
      </div>

      {/* Historical Trends Chart */}
      <AlertTrendsChart />

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Alerts by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={alertsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {alertsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={alertsByLocation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="alerts" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="alerts" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Raw Data Section */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Data (Latest 50 Alerts)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Timestamp</th>
                  <th className="text-left p-2">Location</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Severity</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rawData.slice(0, 50).map((alert, index) => (
                  <tr key={alert.id} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                    <td className="p-2">{new Date(alert.timestamp).toLocaleString()}</td>
                    <td className="p-2">{alert.locations?.name || "Unknown"}</td>
                    <td className="p-2">{alert.alert_type}</td>
                    <td className="p-2">{alert.severity}</td>
                    <td className="p-2">{alert.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
