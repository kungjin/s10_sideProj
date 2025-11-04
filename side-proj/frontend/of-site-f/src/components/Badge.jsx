export default function Badge({ tone="default", children }) {
  const map = {
    default: "badge",
    danger: "badge border-accent bg-accent/10 text-ink",
    info: "badge border-sky bg-sky/10 text-ink",
  };
  return <span className={map[tone] || map.default}>{children}</span>;
}
