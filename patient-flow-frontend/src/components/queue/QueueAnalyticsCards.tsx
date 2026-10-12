import SummaryCard from "../dashboard/SummaryCard";
import type { QueueEntry } from "../../types/queue";

interface Props {
  entries: QueueEntry[];
}

export default function QueueAnalyticsCards({ entries }: Props) {
  // Counts
  const completedCount = entries.filter((e) => e.status === "COMPLETED").length;
  const noShowCount = entries.filter((e) => e.status === "NO_SHOW").length;
  const cancelledCount = entries.filter((e) => e.status === "CANCELLED").length;

  // Filter entries with valid numeric actualWaitingTime >= 0
  const validAwtEntries = entries.filter(
    (e) =>
      typeof e.actualWaitingTime === "number" &&
      !isNaN(e.actualWaitingTime) &&
      e.actualWaitingTime >= 0
  );

  let avgWaitingTimeDisplay = "—";
  if (validAwtEntries.length > 0) {
    const totalAwt = validAwtEntries.reduce((sum, e) => sum + e.actualWaitingTime, 0);
    const avgAwt = Math.round(totalAwt / validAwtEntries.length);
    avgWaitingTimeDisplay = `${avgAwt} min`;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        label="Completed Patients"
        value={completedCount}
        valueColor="text-green-700"
        icon="✅"
      />
      <SummaryCard
        label="No Shows"
        value={noShowCount}
        valueColor="text-gray-600"
        icon="👤"
      />
      <SummaryCard
        label="Cancelled"
        value={cancelledCount}
        valueColor="text-red-600"
        icon="🚫"
      />
      <SummaryCard
        label="Average Waiting Time"
        value={avgWaitingTimeDisplay}
        valueColor="text-blue-700"
        icon="⏱️"
      />
    </div>
  );
}
