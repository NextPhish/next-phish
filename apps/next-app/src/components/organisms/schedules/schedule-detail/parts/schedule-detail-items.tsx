export function DetailItem({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
      {helper && <p>{helper}</p>}
    </div>
  );
}
