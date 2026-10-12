/**
 * Shared UI utility components and Tailwind class tokens.
 * Import from here instead of duplicating across files.
 */

// ---------------------------------------------------------------------------
// Tailwind class tokens
// ---------------------------------------------------------------------------

/** Standard text input / select / textarea styling */
export const inputCls =
  "w-full px-4 py-2.5 rounded-lg border text-sm text-gray-800 placeholder-gray-400 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
  "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed";

/** Standard form label */
export const labelCls = "block text-sm font-medium text-gray-700 mb-1";

/** Standard primary action button */
export const btnPrimaryCls =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg " +
  "bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 " +
  "disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

/** Standard secondary/outline button */
export const btnOutlineCls =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg " +
  "border border-gray-300 text-gray-700 text-sm font-medium bg-white hover:bg-gray-50 " +
  "disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

// ---------------------------------------------------------------------------
// Spinner component
// ---------------------------------------------------------------------------

interface SpinnerProps {
  size?: "sm" | "md";
  /** Color class e.g. "text-blue-600" */
  color?: string;
}

export function Spinner({ size = "md", color = "text-blue-600" }: SpinnerProps) {
  const dim = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <svg
      className={`animate-spin ${dim} ${color}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Alert banners
// ---------------------------------------------------------------------------

interface AlertProps {
  message: string;
  /** Additional detail line */
  detail?: string;
}

/** Error alert — announces itself to screen readers */
export function ErrorAlert({ message, detail }: AlertProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3"
    >
      <span className="text-red-500 text-lg mt-0.5 select-none" aria-hidden="true">
        ⚠️
      </span>
      <div>
        <p className="text-sm font-medium text-red-700">{message}</p>
        {detail && <p className="text-sm text-red-600 mt-0.5">{detail}</p>}
      </div>
    </div>
  );
}

/** Success alert — announces itself to screen readers */
export function SuccessAlert({ message, detail }: AlertProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-lg border border-green-300 bg-green-50 px-4 py-3"
    >
      <span className="text-green-500 text-lg select-none" aria-hidden="true">
        ✅
      </span>
      <div>
        <p className="text-sm font-medium text-green-700">{message}</p>
        {detail && <p className="text-sm text-green-600 mt-0.5">{detail}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading row (centred spinner + text)
// ---------------------------------------------------------------------------

interface LoadingRowProps {
  message?: string;
  className?: string;
}

export function LoadingRow({ message = "Loading…", className = "py-14" }: LoadingRowProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center gap-3 text-gray-500 ${className}`}
    >
      <Spinner />
      <span className="text-sm">{message}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon = "🔍", title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-12 text-gray-400">
      <div className="text-4xl mb-3" aria-hidden="true">{icon}</div>
      <p className="font-medium text-gray-500">{title}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section card wrapper
// ---------------------------------------------------------------------------

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ children, className = "" }: SectionCardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page heading
// ---------------------------------------------------------------------------

interface PageHeadingProps {
  title: string;
  subtitle?: string;
}

export function PageHeading({ title, subtitle }: PageHeadingProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      {subtitle && <p className="mt-1 text-gray-500">{subtitle}</p>}
    </div>
  );
}
