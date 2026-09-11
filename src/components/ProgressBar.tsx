export function ProgressBar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label?: string;
}) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="bar-wrap">
      <div
        className="bar"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <span className="bar-fill" style={{ width: `${pct}%` }} />
      </div>
      {label ? <span className="bar-label">{label}</span> : null}
    </div>
  );
}
