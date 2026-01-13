"use client";

// ============================================
// Graphique de progression
// ============================================

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface ProgressChartProps {
  data: DataPoint[];
  title?: string;
  valueLabel?: string;
  color?: string;
}

export function ProgressChart({
  data,
  title,
  valueLabel = "Valeur",
  color = "hsl(var(--primary))",
}: ProgressChartProps) {
  // Memoize formatted data to avoid recalculating on every render
  const formattedData = useMemo(
    () =>
      data.map((point) => ({
        ...point,
        formattedDate: format(new Date(point.date), "d MMM", { locale: fr }),
      })),
    [data]
  );

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        Pas assez de données pour afficher le graphique
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={formattedData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
          <XAxis
            dataKey="formattedDate"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(value: number) => [value, valueLabel]}
            labelFormatter={(label) => label}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{
              fill: color,
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{
              r: 6,
              fill: color,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
