import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface LocationCardProps {
  id: string;
  name: string;
  region: string;
  status: "normal" | "warning" | "alert";
  latitude: number;
  longitude: number;
}

const statusConfig = {
  normal: {
    color: "bg-status-normal",
    label: "Normal",
    variant: "secondary" as const,
  },
  warning: {
    color: "bg-status-warning",
    label: "Warning",
    variant: "default" as const,
  },
  alert: {
    color: "bg-status-alert glow-alert",
    label: "Alert",
    variant: "destructive" as const,
  },
};

export const LocationCard = ({ id, name, region, status, latitude, longitude }: LocationCardProps) => {
  const navigate = useNavigate();
  const config = statusConfig[status];

  return (
    <Card className={`transition-all hover:scale-[1.02] ${status === "alert" ? "border-primary" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.color}`}>
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <p className="text-sm text-muted-foreground">{region}</p>
            </div>
          </div>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <p>Lat: {latitude.toFixed(6)}</p>
            <p>Lng: {longitude.toFixed(6)}</p>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigate(`/map?location=${id}`)}
          >
            View on Map
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
