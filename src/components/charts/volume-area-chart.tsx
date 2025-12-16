"use client";

// ============================================
// Volume Area Chart - Progression par exercice
// ============================================

import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ChartDataPoint } from "@/lib/chart-utils";

interface VolumeAreaChartProps {
  data: ChartDataPoint[];
  exerciseName: string;
}

export function VolumeAreaChart({ data, exerciseName }: VolumeAreaChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        Aucune donnée pour {exerciseName}
      </div>
    );
  }

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={12}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={12}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelStyle={{ fontWeight: "bold" }}
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#volumeGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
