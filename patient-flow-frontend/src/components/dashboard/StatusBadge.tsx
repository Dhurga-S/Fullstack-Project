import type { QueueEntryStatus } from "../../types/queue";

interface Props {
  status: QueueEntryStatus;
}

const config: Record<QueueEntryStatus, { label: string; className: string }> = {
  WAITING: {
    label: "Waiting",
    className:
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800",
  },
  CALLED: {
    label: "Called",
    className:
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800",
  },
  IN_CONSULTATION: {
    label: "In Consultation",
    className:
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800",
  },
  COMPLETED: {
    label: "Completed",
    className:
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800",
  },
  NO_SHOW: {
    label: "No Show",
    className:
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-600",
  },
  CANCELLED: {
    label: "Cancelled",
    className:
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-600",
  },
};

export default function StatusBadge({ status }: Props) {
  const { label, className } = config[status] ?? {
    label: status,
    className:
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700",
  };

  return <span className={className}>{label}</span>;
}
