import { AlertCircle } from "lucide-react";

interface DashboardSectionErrorProps {
  title?: string;
  message: string;
}

export function DashboardSectionError({
  title = "Nao foi possivel carregar esta secao",
  message,
}: DashboardSectionErrorProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-1 text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
