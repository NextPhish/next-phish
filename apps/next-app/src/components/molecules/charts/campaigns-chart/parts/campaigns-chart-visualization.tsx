import { lazy } from "react";
import type { CampaignsChartData } from "../types/campaigns-chart.types";

interface Props {
  data: CampaignsChartData[];
  axis: string;
  grid: string;
  seriesName: string;
  fill: string;
}

export default lazy(() =>
  import("recharts").then(
    ({
      Bar,
      BarChart,
      CartesianGrid,
      ResponsiveContainer,
      Tooltip,
      XAxis,
      YAxis,
    }) => ({
      default: function CampaignsChartVisualization({
        data,
        axis,
        grid,
        seriesName,
        fill,
      }: Props) {
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
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
              <Tooltip cursor={{ fill: grid }} />
              <Bar
                dataKey="campaigns"
                name={seriesName}
                fill={fill}
                radius={[6, 6, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      },
    }),
  ),
);
