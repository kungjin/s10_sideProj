export default function Section({ title, subtitle, children, className = "" }) {
  return (
    <section className={`max-w-6xl mx-auto px-5 ${className}`}>
      {(title || subtitle) && (
        <header className="mb-6">
          {title && <h2 className="text-2xl font-bold">{title}</h2>}
          {subtitle && <p className="text-subink mt-1">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
