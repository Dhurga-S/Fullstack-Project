import type { QueuePriority } from "../../types/queue";

interface Props {
  priority: QueuePriority;
}

const config: Record<QueuePriority, { label: string; className: string }> = {
  1: {
    label: "🚨 Emergency",
    className:
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800",
  },
  2: {
    label: "⚡ Urgent",
    className:
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800",
  },
  3: {
    label: "✅ Normal",
    className:
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800",
  },
};

export default function PriorityBadge({ priority }: Props) {
  const { label, className } = config[priority] ?? {
    label: String(priority),
    className:
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700",
  };

  return <span className={className}>{label}</span>;
}
