import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { label: "Dashboard", to: "/patient-flow" },
  { label: "Triage", to: "/patient-flow/triage" },
  { label: "Join Queue", to: "/patient-flow/queue" },
  { label: "Queue Status", to: "/patient-flow/queue-status" },
  { label: "Queue Mgmt", to: "/patient-flow/queue-management" },
  { label: "Performance", to: "/patient-flow/queue-performance" },
  { label: "History", to: "/patient-flow/queue-history" },
  { label: "Optimization", to: "/patient-flow/optimization" },
];

// nav link base — text-sm (14px) on desktop keeps 8 items fitting
const linkBase =
  "px-3 py-2 rounded-md text-sm font-semibold transition-colors whitespace-nowrap flex-shrink-0 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700";

export default function PatientFlowLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-2xl" aria-hidden="true">🏥</span>
            <div>
              <p className="text-base font-bold leading-tight tracking-tight">
                Patient Flow System
              </p>
              <p className="text-blue-300 text-sm leading-snug">
                Queue &amp; Resource Management
              </p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav
            aria-label="Patient Flow navigation"
            className="hidden md:flex items-center gap-0.5 overflow-x-auto"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/patient-flow"}
                aria-current={undefined}
                className={({ isActive }) =>
                  `${linkBase} ${
                    isActive
                      ? "bg-blue-950 text-white"
                      : "text-white/80 hover:bg-blue-700 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <span aria-current={isActive ? "page" : undefined}>
                    {item.label}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile nav drawer */}
        {menuOpen && (
          <nav
            id="mobile-nav"
            aria-label="Patient Flow navigation"
            className="md:hidden border-t border-blue-700 px-5 py-3 flex flex-col gap-1"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/patient-flow"}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? "bg-blue-950 text-white"
                      : "text-white/80 hover:bg-blue-700 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <span aria-current={isActive ? "page" : undefined}>
                    {item.label}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-5 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white text-center text-sm text-gray-400 py-4">
        Patient Flow Optimization Platform &mdash; Hospital Resource Coordination
      </footer>
    </div>
  );
}
