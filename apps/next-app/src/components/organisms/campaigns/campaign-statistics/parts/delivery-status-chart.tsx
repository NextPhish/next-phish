"use client";

import { lazy } from "react";

export interface DeliveryStatusDatum {
  name: string;
  value: number;
  color: string;
}

const DeliveryStatusChart = lazy(() =>
  import("recharts").then(
    ({ Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip }) => ({
      default: function DeliveryStatusVisualization({
        data,
      }: {
        data: DeliveryStatusDatum[];
      }) {
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart accessibilityLayer>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="62%"
                outerRadius="82%"
                paddingAngle={1}
                isAnimationActive={false}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ color: "#626d80", fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      },
    }),
  ),
);

export default DeliveryStatusChart;
