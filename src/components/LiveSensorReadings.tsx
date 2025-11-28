import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SensorCard } from "@/components/SensorCard";
import { Thermometer, Wind, Flame, Droplets, Activity, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface SensorData {
  flame: string;
  gas: number;
  temperature: number;
  humidity: number;
  pir: string;
  timestamp: string;
}

interface Location {
  id: string;
  name: string;
  region: string;
  thingspeak_channel_id: string | null;
  thingspeak_read_key: string | null;
}

export const LiveSensorReadings = () => {
  const { toast } = useToast();
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchLocationAndSensorData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLocationAndSensorData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLocationAndSensorData = async () => {
    try {
      // Get location with ThingSpeak credentials
      const { data: locations, error: locationError } = await supabase
        .from("locations")
        .select("id, name, region, thingspeak_channel_id, thingspeak_read_key")
        .not("thingspeak_channel_id", "is", null)
        .limit(1)
        .single();

      if (locationError) throw locationError;
      
      if (!locations) {
        setIsLoading(false);
        return;
      }

      setLocation(locations);

      // Fetch sensor data from ThingSpeak via edge function
      const { data, error } = await supabase.functions.invoke("thingspeak-service", {
        body: {
          action: "latest",
          location: locations,
        },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        setSensorData(data.data);
      }
    } catch (error) {
      console.error("Error fetching sensor data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLocationAndSensorData();
    setIsRefreshing(false);
    toast({
      title: "Sensors Updated",
      description: "Latest sensor readings fetched from cloud.",
    });
  };

  const getSensorStatus = (type: string, value: number | string): "normal" | "warning" | "danger" => {
    if (type === "temperature") {
      const temp = typeof value === "number" ? value : parseFloat(value);
      if (temp > 45) return "danger";
      if (temp > 35) return "warning";
      return "normal";
    }
    if (type === "gas") {
      const gas = typeof value === "number" ? value : parseFloat(value);
      if (gas > 800) return "danger";
      if (gas > 400) return "warning";
      return "normal";
    }
    if (type === "flame") {
      return value === "1" || value === 1 ? "danger" : "normal";
    }
    if (type === "humidity") {
      const hum = typeof value === "number" ? value : parseFloat(value);
      if (hum < 20 || hum > 80) return "warning";
      return "normal";
    }
    return "normal";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading sensor data...
        </CardContent>
      </Card>
    );
  }

  if (!location) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No location with ThingSpeak integration found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Live Sensor Readings</CardTitle>
          <p className="text-sm text-muted-foreground">
            {location.name} - {location.region}
          </p>
          {sensorData?.timestamp && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {formatDistanceToNow(new Date(sensorData.timestamp), { addSuffix: true })}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {sensorData ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <SensorCard
              title="Temperature"
              value={sensorData.temperature?.toFixed(1) ?? "--"}
              unit="°C"
              icon={Thermometer}
              status={getSensorStatus("temperature", sensorData.temperature)}
            />
            <SensorCard
              title="Gas Level"
              value={sensorData.gas?.toFixed(0) ?? "--"}
              unit="ppm"
              icon={Wind}
              status={getSensorStatus("gas", sensorData.gas)}
            />
            <SensorCard
              title="Flame Detected"
              value={String(sensorData.flame) === "1" ? "Yes" : "No"}
              icon={Flame}
              status={getSensorStatus("flame", sensorData.flame)}
            />
            <SensorCard
              title="Humidity"
              value={sensorData.humidity?.toFixed(1) ?? "--"}
              unit="%"
              icon={Droplets}
              status={getSensorStatus("humidity", sensorData.humidity)}
            />
            <SensorCard
              title="Motion (PIR)"
              value={String(sensorData.pir) === "1" ? "Detected" : "None"}
              icon={Activity}
              status={String(sensorData.pir) === "1" ? "warning" : "normal"}
            />
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            Unable to fetch sensor data. Check ThingSpeak connection.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
