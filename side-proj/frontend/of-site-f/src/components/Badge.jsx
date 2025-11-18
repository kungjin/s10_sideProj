export default function Badge({ tone = "info", className = "", children }) {
  const toneClass =
    tone === "info"
      ? "bg-sky-50 text-sky-700 border-sky-200"
      : tone === "danger"
      ? "bg-red-50 text-red-700 border-red-200"
      : tone === "alert"
      ? "bg-primary/10 text-primary border-primary/20"
      : "";

  return (
    <span className={`badge ${toneClass} ${className}`}>
      {children}
    </span>
  );
}