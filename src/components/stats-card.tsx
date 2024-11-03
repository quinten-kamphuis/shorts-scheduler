import { LucideIcon } from "lucide-react";

type StatsCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  format?: "number" | "percent";
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  format = "number",
}: StatsCardProps) {
  const formattedValue =
    format === "percent" ? `${value}%` : value.toLocaleString();

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-semibold">{formattedValue}</p>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        <div className="rounded-full bg-blue-50 p-2">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
      </div>
    </div>
  );
}
