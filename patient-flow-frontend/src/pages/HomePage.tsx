import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-lg px-4">
        <div className="text-6xl mb-4">🏥</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Hospital Resource Coordination Platform
        </h1>
        <p className="text-gray-500 mb-8">
          Patient Flow &amp; Queue Management System
        </p>
        <button
          onClick={() => navigate("/patient-flow")}
          className="bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
        >
          Go to Patient Flow
        </button>
      </div>
    </div>
  );
}
