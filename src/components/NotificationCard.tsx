import { AlertTriangle, Flame, Gauge, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface NotificationCardProps {
  id: string;
  locationType: string;
  alertType: "fire" | "gas" | "temp" | "motion";
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "resolved" | "false_alarm";
}

const alertIcons = {
  fire: Flame,
  gas: Wind,
  temp: Gauge,
  motion: AlertTriangle,
};

const severityColors = {
  low: "bg-status-normal",
  medium: "bg-status-warning",
  high: "bg-status-alert",
  critical: "bg-status-critical",
};

export const NotificationCard = ({
  id,
  locationType,
  alertType,
  timestamp,
  severity,
  status,
}: NotificationCardProps) => {
  const navigate = useNavigate();
  const Icon = alertIcons[alertType];
  const isActive = status === "active";

  return (
    <Card 
      className={`transition-all hover:scale-[1.02] border-l-4 ${
        isActive 
          ? "border-l-primary shadow-lg glow-alert" 
          : "border-l-muted"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isActive ? "bg-primary/20" : "bg-muted"} ${isActive ? "pulse-alert" : ""}`}>
              <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{locationType}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Badge 
            variant={isActive ? "destructive" : "secondary"}
            className={`${isActive ? severityColors[severity] : ""}`}
          >
            {severity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{alertType}</Badge>
            <Badge variant={isActive ? "default" : "secondary"}>
              {status}
            </Badge>
          </div>
          <Button 
            size="sm" 
            variant={isActive ? "default" : "secondary"}
            onClick={() => navigate(`/alert/${id}`)}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
