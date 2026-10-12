interface Props {
  label: string;
  value: string | number;
  /** Accent colour class for the value text, e.g. "text-blue-700" */
  valueColor?: string;
  icon?: string;
}

export default function SummaryCard({
  label,
  value,
  valueColor = "text-blue-700",
  icon,
}: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex items-start gap-4">
      {icon && (
        <div className="text-3xl mt-0.5 select-none" aria-hidden="true">
          {icon}
        </div>
      )}
      <div>
        {/* label: text-sm (14px) — compact but readable */}
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        {/* value: text-4xl (~36px) — prominent metric */}
        <p className={`mt-1 text-4xl font-bold leading-tight ${valueColor}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
