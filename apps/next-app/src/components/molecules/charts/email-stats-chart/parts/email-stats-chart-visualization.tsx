import { lazy } from "react";
import type {
  EmailChartData,
  EmailChartSeries,
} from "../types/email-stats-chart.types";

interface Props {
  data: EmailChartData[];
  series: EmailChartSeries[];
  axis: string;
  grid: string;
}

export default lazy(() =>
  import("recharts").then(
    ({
      CartesianGrid,
      Legend,
      Line,
      LineChart,
      ResponsiveContainer,
      Tooltip,
      XAxis,
      YAxis,
    }) => ({
      default: function EmailStatsChartVisualization({
        data,
        series,
        axis,
        grid,
      }: Props) {
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 12, bottom: 0, left: -16 }}
              accessibilityLayer
            >
              <CartesianGrid stroke={grid} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: axis, fontSize: 11 }}
                axisLine={{ stroke: grid }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: axis, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Legend wrapperStyle={{ color: axis, fontSize: 11 }} />
              {series.map(({ field, name, color }) => (
                <Line
                  key={field}
                  type="monotone"
                  dataKey={field}
                  name={name}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      },
    }),
  ),
);
