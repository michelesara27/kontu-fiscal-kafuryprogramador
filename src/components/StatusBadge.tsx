import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: 'pendente' | 'concluida' | 'atrasada';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    pendente: {
      label: "Pendente",
      icon: Clock,
      className: "bg-status-pending/20 text-status-pending border-status-pending/30 hover:bg-status-pending/30",
    },
    concluida: {
      label: "Concluída",
      icon: CheckCircle,
      className: "bg-status-completed/20 text-status-completed border-status-completed/30 hover:bg-status-completed/30",
    },
    atrasada: {
      label: "Atrasada",
      icon: AlertCircle,
      className: "bg-status-overdue/20 text-status-overdue border-status-overdue/30 hover:bg-status-overdue/30",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} ${className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}
