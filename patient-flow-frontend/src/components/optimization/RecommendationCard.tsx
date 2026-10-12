import type { OptimizationRecommendation } from "../../types/optimization";

interface Props {
  recommendation: OptimizationRecommendation;
}

export default function RecommendationCard({ recommendation }: Props) {
  const { ruleCode, importance, title, explanation, suggestedAction, supportingData } =
    recommendation;

  const isHigh = importance === "HIGH";
  const isMedium = importance === "MEDIUM";

  // Card theme styling based on importance
  const cardBorderClass = isHigh
    ? "border-red-300 bg-red-50/70 border-l-4 border-l-red-600 shadow-sm"
    : isMedium
    ? "border-amber-300 bg-amber-50/50 border-l-4 border-l-amber-500 shadow-sm"
    : "border-blue-200 bg-blue-50/40 border-l-4 border-l-blue-500 shadow-sm";

  const badgeClass = isHigh
    ? "bg-red-100 text-red-800 border-red-300"
    : isMedium
    ? "bg-amber-100 text-amber-800 border-amber-300"
    : "bg-blue-100 text-blue-800 border-blue-300";

  const badgeText = isHigh
    ? "🚨 HIGH-IMPORTANCE ALERT"
    : isMedium
    ? "⚠️ OPERATIONAL SUGGESTION"
    : "ℹ️ OPERATIONAL NOTICE";

  const titleClass = isHigh
    ? "text-red-900 font-bold text-lg"
    : isMedium
    ? "text-amber-900 font-bold text-base"
    : "text-blue-900 font-bold text-base";

  const actionBoxClass = isHigh
    ? "bg-white/90 border border-red-200 text-red-950"
    : isMedium
    ? "bg-white/90 border border-amber-200 text-amber-950"
    : "bg-white/90 border border-blue-200 text-blue-950";

  return (
    <div
      className={`rounded-lg border p-5 transition-shadow hover:shadow-md ${cardBorderClass}`}
    >
      {/* Top Header: Badge and Rule Code */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border uppercase ${badgeClass}`}
        >
          {badgeText}
        </span>
        <span className="text-xs font-medium text-gray-400">
          {ruleCode}
        </span>
      </div>

      {/* Title */}
      <h4 className={`mb-2 leading-snug ${titleClass}`}>
        {title}
      </h4>

      {/* Explanation */}
      <p className="text-sm text-gray-700 mb-4 leading-relaxed">
        {explanation}
      </p>

      {/* Suggested Action Box */}
      <div className={`rounded-md p-3.5 mb-3 ${actionBoxClass}`}>
        <div className="flex items-start gap-2">
          <span className="text-base select-none mt-0.5" aria-hidden="true">
            📋
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">
              Suggested Action
            </p>
            <p className="text-sm font-medium leading-relaxed">
              {suggestedAction}
            </p>
          </div>
        </div>
      </div>

      {/* Supporting Data / Queue Numbers / Counts */}
      {supportingData && (
        <div className="pt-2 border-t border-gray-200/60 mt-3 text-xs text-gray-600 flex flex-col gap-1.5">
          {supportingData.patientDetails && supportingData.patientDetails.length > 0 ? (
            <div>
              <span className="font-semibold text-gray-700 mr-2">
                Affected Queue Numbers &amp; Estimated Waits:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {supportingData.patientDetails.map((p) => (
                  <span
                    key={p.queueNumber}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-gray-300 font-mono text-xs text-gray-800 shadow-2xs"
                  >
                    <span className="font-semibold text-blue-700">#{p.queueNumber}</span>
                    {typeof p.estimatedWaitingTime === "number" && (
                      <span className="text-gray-500">
                        ({p.estimatedWaitingTime} min)
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ) : supportingData.queueNumbers && supportingData.queueNumbers.length > 0 ? (
            <div>
              <span className="font-semibold text-gray-700 mr-2">
                Relevant Queue Numbers:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {supportingData.queueNumbers.map((num) => (
                  <span
                    key={num}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-gray-300 font-mono font-semibold text-xs text-blue-800 shadow-2xs"
                  >
                    #{num}
                  </span>
                ))}
              </div>
            </div>
          ) : typeof supportingData.count === "number" ? (
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">Count:</span>{" "}
              {supportingData.count} patient(s)
              {supportingData.threshold !== undefined && (
                <span> (Threshold: {supportingData.threshold})</span>
              )}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
