import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SensorCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  status?: "normal" | "warning" | "danger";
}

const statusColors = {
  normal: "text-status-normal",
  warning: "text-status-warning",
  danger: "text-status-alert",
};

export const SensorCard = ({ title, value, unit, icon: Icon, status = "normal" }: SensorCardProps) => {
  return (
    <Card className="transition-all hover:scale-[1.02]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${statusColors[status]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {unit && <span className="text-lg text-muted-foreground ml-1">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  );
};
