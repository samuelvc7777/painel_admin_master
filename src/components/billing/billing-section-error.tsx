import { AlertCircle } from "lucide-react";

interface BillingSectionErrorProps {
  title: string;
  message: string;
}

export function BillingSectionError({ title, message }: BillingSectionErrorProps) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0">
          <h3 className="text-sm font-black">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}
