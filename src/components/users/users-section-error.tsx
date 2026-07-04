import { AlertCircle } from "lucide-react";

interface UsersSectionErrorProps {
  title: string;
  message: string;
}

export function UsersSectionError({ title, message }: UsersSectionErrorProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-black">{title}</p>
        <p className="mt-1 text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
