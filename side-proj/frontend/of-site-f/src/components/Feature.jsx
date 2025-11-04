import Card from "./Card";

export default function Feature({ icon, title, desc }) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-sky/15 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-subink mt-1 text-sm leading-6">{desc}</p>
        </div>
      </div>
    </Card>
  );
}
