import TriageForm from "../components/triage/TriageForm";

export default function TriagePage() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Page heading */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Patient Triage</h2>
        <p className="mt-1.5 text-base text-gray-500">
          Record a patient's symptoms, vital signs, and assign a triage level
          to determine their urgency for treatment.
        </p>
      </div>

      {/* Triage form */}
      <TriageForm />
    </div>
  );
}
