"use client";

export type UpdateItem = {
  id?: string;
  title: string;
  time: string;
  href?: string;
  state?: "live" | "muted";
};

export default function UpdatesListing({
  heading = "Recent Activities",
  items = [],
  className = "",
}: {
  heading?: string;
  items: UpdateItem[];
  className?: string;
}) {
  return (
    <section className={"rounded bg-white " + className}>
      <h3 className="px-4 pt-3 text-lg font-semibold text-themeTeal">
        {heading}
      </h3>

      <ul>
        {items.map((u, i) => {
          const key = u.id ?? `${u.title}-${u.time ?? ""}-${i}`;
          const live = u.state !== "muted";
          const rowCls = [
            "flex items-start gap-3 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal/40",
            u.href ? "hover:bg-themeTealWhite/60" : "",
          ].join(" ");

          const dotCls = [
            "mt-2 h-2.5 w-2.5 rounded-full shrink-0",
            live ? "bg-emerald-600" : "bg-slate-400",
          ].join(" ");

          const titleCls = [
            "truncate text-base",
            live ? "text-themeTeal" : "text-themeTealLight",
          ].join(" ");

          const content = (
            <>
              <span aria-hidden className={dotCls} />
              <div className="min-w-0">
                <p className={titleCls}>{u.title}</p>
                <p className="mt-1 text-sm text-themeTealLighter">{u.time}</p>
              </div>
            </>
          );

          return (
            <li key={key} className="px-4 py-3">
              {u.href ? (
                <a href={u.href} className={rowCls}>
                  {content}
                </a>
              ) : (
                <div className={rowCls}>{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
