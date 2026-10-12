import JoinQueueForm from "../components/queue/JoinQueueForm";

export default function QueuePage() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Page heading */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Join Queue</h2>
        <p className="mt-1.5 text-base text-gray-500">
          Add a triaged patient to the appropriate consultation queue. The
          backend will assign priority and queue number automatically.
        </p>
      </div>

      {/* Info note */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
        <strong>How it works:</strong> Enter the patient's ID, their triage
        record ID, and the target queue ID. The backend reads the triage record,
        calculates priority, and creates the queue entry.
      </div>

      {/* Form card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <JoinQueueForm />
      </div>
    </div>
  );
}
