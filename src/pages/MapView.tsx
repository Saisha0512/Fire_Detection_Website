import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Location {
  id: string;
  name: string;
  region: string;
  status: "normal" | "warning" | "alert";
  latitude: number;
  longitude: number;
}

const MapView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    const locationId = searchParams.get("location");
    if (locationId && locations.length > 0) {
      const location = locations.find((loc) => loc.id === locationId);
      if (location) {
        setSelectedLocation(location);
      }
    }
  }, [searchParams, locations]);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name");

      if (error) throw error;

      setLocations((data || []) as Location[]);
    } catch (error) {
      toast({
        title: "Error fetching locations",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "alert":
        return "bg-status-alert";
      case "warning":
        return "bg-status-warning";
      default:
        return "bg-status-normal";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Global Map View</h1>
              <p className="text-sm text-muted-foreground">Monitor all locations in real-time</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>Map</CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  <MapPin className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Map Integration Placeholder</p>
                  <p className="text-sm mt-2 max-w-md text-center">
                    This would display an interactive map with location pins colored by status:
                  </p>
                  <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-status-normal" />
                      <span className="text-sm">Normal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-status-warning" />
                      <span className="text-sm">Warning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-status-alert" />
                      <span className="text-sm">Alert</span>
                    </div>
                  </div>
                  <p className="text-xs mt-6 text-center max-w-md opacity-75">
                    To integrate with Leaflet or Google Maps, add the appropriate library and implement the map component with location markers.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Locations ({locations.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[550px] overflow-y-auto">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : locations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No locations found</p>
                ) : (
                  locations.map((location) => (
                    <div
                      key={location.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                        selectedLocation?.id === location.id
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                      onClick={() => setSelectedLocation(location)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(location.status)}`} />
                          <span className="font-medium">{location.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {location.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{location.region}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {selectedLocation && (
              <Card>
                <CardHeader>
                  <CardTitle>Location Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Name</span>
                    <p className="font-medium">{selectedLocation.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Region</span>
                    <p className="font-medium">{selectedLocation.region}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Status</span>
                    <div className="mt-1">
                      <Badge variant={selectedLocation.status === "alert" ? "destructive" : "secondary"}>
                        {selectedLocation.status}
                      </Badge>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => navigate("/locations")}>
                    View All Locations
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MapView;
