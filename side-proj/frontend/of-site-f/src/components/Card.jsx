export default function Card({ className = "", children }) {
  return (
    <div className={`card hover:shadow-subtle transition ${className}`}>
      {children}
    </div>
  );
}

