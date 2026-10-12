import type { VitalSigns } from "../../types/triage";

interface Props {
  values: VitalSigns;
  onChange: (updated: VitalSigns) => void;
  disabled?: boolean;
}

/**
 * Controlled sub-form for the four optional vital-sign fields.
 * The parent owns the state; this component only fires onChange.
 */
export default function VitalSignsForm({ values, onChange, disabled }: Props) {
  const handleNumber =
    (field: keyof VitalSigns) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      onChange({
        ...values,
        [field]: raw === "" ? undefined : Number(raw),
      });
    };

  const handleText =
    (field: keyof VitalSigns) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      onChange({
        ...values,
        [field]: raw === "" ? undefined : raw,
      });
    };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {/* Temperature */}
      <div>
        <label
          htmlFor="temperature"
          className="block text-base font-medium text-gray-700 mb-1.5"
        >
          Temperature <span className="text-gray-400 font-normal">(°C, optional)</span>
        </label>
        <input
          id="temperature"
          type="number"
          step="0.1"
          min="30"
          max="45"
          placeholder="e.g. 37.5"
          value={values.temperature ?? ""}
          onChange={handleNumber("temperature")}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>

      {/* Heart Rate */}
      <div>
        <label
          htmlFor="heartRate"
          className="block text-base font-medium text-gray-700 mb-1.5"
        >
          Heart Rate <span className="text-gray-400 font-normal">(bpm, optional)</span>
        </label>
        <input
          id="heartRate"
          type="number"
          min="20"
          max="300"
          placeholder="e.g. 72"
          value={values.heartRate ?? ""}
          onChange={handleNumber("heartRate")}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>

      {/* Blood Pressure */}
      <div>
        <label
          htmlFor="bloodPressure"
          className="block text-base font-medium text-gray-700 mb-1.5"
        >
          Blood Pressure{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="bloodPressure"
          type="text"
          placeholder="e.g. 120/80"
          value={values.bloodPressure ?? ""}
          onChange={handleText("bloodPressure")}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>

      {/* Oxygen Saturation */}
      <div>
        <label
          htmlFor="oxygenSaturation"
          className="block text-base font-medium text-gray-700 mb-1.5"
        >
          Oxygen Saturation{" "}
          <span className="text-gray-400 font-normal">(SpO₂ %, optional)</span>
        </label>
        <input
          id="oxygenSaturation"
          type="number"
          min="50"
          max="100"
          placeholder="e.g. 98"
          value={values.oxygenSaturation ?? ""}
          onChange={handleNumber("oxygenSaturation")}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>
    </div>
  );
}
