export default function ScorecardSection() {
  const items = [
    {
      title: "Quality",
      desc:
        "Explore a dynamic range of top-performing unlisted stocks—from high-growth startups to established private giants.",
      badge: { label: "Excellent", sub: "Rank #1 of 5", tone: "green" as const },
    },
    {
      title: "Valuation",
      desc:
        "Explore a dynamic range of top-performing unlisted stocks—from high-growth startups to established private giants.",
      badge: { label: "Fair", sub: "", tone: "orange" as const },
    },
    {
      title: "Financial Trend",
      desc:
        "Explore a dynamic range of top-performing unlisted stocks—from high-growth startups to established private giants.",
      badge: { label: "Positive", sub: "Score 11", tone: "green" as const },
    },
  ];

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {items.map(({ title, desc, badge }) => (
        <article key={title} className="text-center px-2">
          <h3 className="text-3xl md:text-xl font-semibold text-themeTeal">{title}</h3>
          <p className="mt-3 text-themeTealLight text-md leading-6">
            {desc}
          </p>

          <div className="mt-8 flex items-center justify-center">
            <BadgeCircle label={badge.label} sub={badge.sub} tone={badge.tone} />
          </div>
        </article>
      ))}
    </div>
  );
}

function BadgeCircle({
  label,
  sub,
  tone, // 'green' | 'orange'
}: {
  label: string;
  sub?: string;
  tone: "green" | "orange";
}) {
  const toneCls =
    tone === "green" ? "bg-green-700" : "bg-orange-500";

  return (
    <div
      className={[
        "rounded-full grid place-content-center",
        "w-56 h-56 md:w-72 md:h-72",
        "border-6 border-themeTeal",
        toneCls,
      ].join(" ")}
      aria-label={`${label}${sub ? `, ${sub}` : ""}`}
    >
      <div className="text-themeTealWhite text-3xl md:text-3xl font-semibold">{label}</div>
      {sub ? <div className="mt-2 text-themeTealWhite text-md">{sub}</div> : null}
    </div>
  );
}
