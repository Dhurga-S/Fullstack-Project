import type { OptimizationMetrics } from "../../types/optimization";
import SummaryCard from "../dashboard/SummaryCard";

interface Props {
  metrics: OptimizationMetrics;
}

export default function OptimizationSummary({ metrics }: Props) {
  const cards = [
    {
      label: "Waiting Patients",
      value: metrics.waitingPatients,
      valueColor: "text-blue-700",
      icon: "🪑",
    },
    {
      label: "Emergency Patients Waiting",
      value: metrics.emergencyPatientsWaiting,
      valueColor:
        metrics.emergencyPatientsWaiting > 0 ? "text-red-600" : "text-gray-700",
      icon: "🚨",
    },
    {
      label: "Patients Called",
      value: metrics.patientsCalled,
      valueColor:
        metrics.patientsCalled > 0 ? "text-yellow-600" : "text-gray-700",
      icon: "📢",
    },
    {
      label: "Patients in Consultation",
      value: metrics.patientsInConsultation,
      valueColor:
        metrics.patientsInConsultation > 0 ? "text-purple-700" : "text-gray-700",
      icon: "🩺",
    },
    {
      label: "Estimated Wait ≥ 30 min",
      value: metrics.longEstimatedWaitPatients,
      valueColor:
        metrics.longEstimatedWaitPatients > 0 ? "text-orange-600" : "text-gray-700",
      icon: "⏳",
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Summary Metrics (Actual Queue Data)
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <SummaryCard
            key={c.label}
            label={c.label}
            value={c.value}
            valueColor={c.valueColor}
            icon={c.icon}
          />
        ))}
      </div>
    </div>
  );
}
