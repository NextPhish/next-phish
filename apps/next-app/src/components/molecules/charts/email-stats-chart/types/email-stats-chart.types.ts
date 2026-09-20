export interface EmailChartData {
  month: string;
  sent?: number;
  opened?: number;
  clicked?: number;
  submitted?: number;
  reported?: number;
  failed?: number;
}
export interface EmailChartSeries {
  field: Exclude<keyof EmailChartData, "month">;
  name: string;
  color: string;
}
