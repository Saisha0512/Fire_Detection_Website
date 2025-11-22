import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SensorCard } from "@/components/SensorCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Flame, Gauge, Wind, Activity, Droplets, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AlertDetail {
  id: string;
  alert_type: string;
  timestamp: string;
  severity: string;
  status: string;
  sensor_values: Record<string, any>;
  locations: {
    name: string;
    region: string;
    latitude: number;
    longitude: number;
  };
}

const AlertDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [alert, setAlert] = useState<AlertDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAlertDetails();
    }
  }, [id]);

  const fetchAlertDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("alerts")
        .select("*, locations(*)")
        .eq("id", id)
        .single();

      if (error) throw error;

      setAlert(data as any);
    } catch (error) {
      toast({
        title: "Error fetching alert details",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!alert) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("alerts")
        .update({
          status: newStatus,
          resolved_at: newStatus !== "active" ? new Date().toISOString() : null,
          resolved_by: newStatus !== "active" ? (await supabase.auth.getUser()).data.user?.id : null,
        })
        .eq("id", alert.id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Alert marked as ${newStatus}`,
      });

      fetchAlertDetails();
    } catch (error) {
      toast({
        title: "Error updating status",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading alert details...</p>
      </div>
    );
  }

  if (!alert) {
    return null;
  }

  const sensorData = alert.sensor_values || {};

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Alert Details</h1>
              <p className="text-sm text-muted-foreground">{alert.locations.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={alert.status} onValueChange={handleStatusUpdate} disabled={isUpdating}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="false_alarm">False Alarm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Alert Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Alert Type</span>
                <Badge variant="outline">{alert.alert_type}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Severity</span>
                <Badge variant="destructive">{alert.severity}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="secondary">{alert.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Timestamp</span>
                <span className="text-sm">
                  {format(new Date(alert.timestamp), "PPpp")}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm font-medium">{alert.locations.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Region</span>
                <span className="text-sm">{alert.locations.region}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Coordinates</span>
                <span className="text-sm">
                  {alert.locations.latitude.toFixed(6)}, {alert.locations.longitude.toFixed(6)}
                </span>
              </div>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate(`/map?location=${alert.locations}`)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                View on Map
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Sensor Readings</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SensorCard
              title="Flame Detector"
              value={sensorData.flame || "N/A"}
              icon={Flame}
              status={sensorData.flame === "Detected" ? "danger" : "normal"}
            />
            <SensorCard
              title="Gas Level"
              value={sensorData.gas || "N/A"}
              unit="ppm"
              icon={Wind}
              status={sensorData.gas > 400 ? "danger" : "normal"}
            />
            <SensorCard
              title="Temperature"
              value={sensorData.temperature || "N/A"}
              unit="°C"
              icon={Gauge}
              status={sensorData.temperature > 40 ? "warning" : "normal"}
            />
            <SensorCard
              title="Humidity"
              value={sensorData.humidity || "N/A"}
              unit="%"
              icon={Droplets}
              status="normal"
            />
            <SensorCard
              title="Motion Sensor"
              value={sensorData.pir || "N/A"}
              icon={Activity}
              status={sensorData.pir === "Motion Detected" ? "warning" : "normal"}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sensor Trend (Demo Data)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Chart visualization would display here with historical sensor data</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AlertDetails;
