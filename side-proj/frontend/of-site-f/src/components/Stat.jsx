export default function Stat({ label, value }) {
  return (
    <div className="card-tight">
      <div className="text-xs text-subink">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  );
}
