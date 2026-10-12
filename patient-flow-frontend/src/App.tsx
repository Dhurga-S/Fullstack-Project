import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PatientFlowLayout from "./layouts/PatientFlowLayout";
import HomePage from "./pages/HomePage";
import PatientFlowDashboard from "./pages/PatientFlowDashboard";
import QueueHistoryPage from "./pages/QueueHistoryPage";
import QueueManagementPage from "./pages/QueueManagementPage";
import QueuePage from "./pages/QueuePage";
import PatientFlowOptimizationPage from "./pages/PatientFlowOptimizationPage";
import QueuePerformancePage from "./pages/QueuePerformancePage";
import QueueStatusPage from "./pages/QueueStatusPage";
import TriagePage from "./pages/TriagePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root */}
        <Route path="/" element={<HomePage />} />

        {/* Patient Flow module — nested under shared layout */}
        <Route path="/patient-flow" element={<PatientFlowLayout />}>
          <Route index element={<PatientFlowDashboard />} />
          <Route path="queue" element={<QueuePage />} />
          <Route path="queue-status" element={<QueueStatusPage />} />
          <Route path="queue-management" element={<QueueManagementPage />} />
          <Route path="queue-performance" element={<QueuePerformancePage />} />
          <Route path="queue-history" element={<QueueHistoryPage />} />
          <Route path="optimization" element={<PatientFlowOptimizationPage />} />
          <Route path="triage" element={<TriagePage />} />
        </Route>

        {/* Fallback: redirect unknown paths to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
