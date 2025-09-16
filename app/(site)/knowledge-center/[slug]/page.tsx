"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, TrendingUp } from "lucide-react";
import Breadcrumbs, { type Crumb } from "@/components/subcomponents/breadcrumbs";
import { Button, Heading } from "@/components/ui";
import Image from "next/image";
import RelatedCarousel, { type RelatedItem } from "@/components/subcomponents/relatedCarousel";


// ---------- Types ----------
type ItemType = "Guide" | "Article";

export type Article = {
  slug: string;
  type: ItemType;
  topic:
    | "Buying & Selling"
    | "Opportunity Assessment"
    | "Risk Assessment"
    | "Private Market Education";
  title: string;
  dateISO: string; // YYYY-MM-DD
  hero: string;
  content: string[]; // simple paragraphs; replace with CMS rich text
};

// ---------- Mock Data (replace with CMS/API) ----------
const ARTICLES: Article[] = [
  {
    slug: "an-introduction-to-the-role-of-a-investapps-private-market-specialist",
    type: "Guide",
    topic: "Private Market Education",
    title: "How Will the Tariff Sell–Off Hit Your Private Company Portfolio",
    dateISO: "2025-08-20",
    hero: "/images/news2.webp",
    content: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer eget neque at enim fringilla varius. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Proin feugiat dolor in lacus accumsan, ac porta lectus dapibus. Donec nisi tellus, ultrices eu dui eget, mattis gravida ipsum. In non nibh at lacus cursus aliquam. Duis commodo feugiat nibh, in auctor ante fermentum ut. Fusce tincidunt in augue vitae tempus. Sed elementum ligula id posuere ullamcorper.", 
      "Sed eget mauris congue purus aliquet blandit. In imperdiet convallis nisl, in commodo magna mattis non. Nullam ac dolor quam. Nam tempus sapien diam, in tempor nisi gravida at. Ut ac convallis velit, sed tristique orci. Maecenas semper, magna eget mattis malesuada, orci tellus porta ipsum, sit amet hendrerit libero augue eget sem. Nunc non maximus est. Quisque nisl felis, ultricies pharetra eros sit amet, interdum auctor eros. Phasellus sed mi placerat, tempor diam nec, fermentum mi.",
    ],
  },
  {
    slug: "investing-in-private-company-shares-a-guide-for-new-investors",
    type: "Guide",
    topic: "Private Market Education",
    title: "Investing in private company shares: A guide for new investors",
    dateISO: "2025-08-06",
    hero: "/images/news1.webp",
    content: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer eget neque at enim fringilla varius. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Proin feugiat dolor in lacus accumsan, ac porta lectus dapibus. Donec nisi tellus, ultrices eu dui eget, mattis gravida ipsum. In non nibh at lacus cursus aliquam. Duis commodo feugiat nibh, in auctor ante fermentum ut. Fusce tincidunt in augue vitae tempus. Sed elementum ligula id posuere ullamcorper.", 
      "Sed eget mauris congue purus aliquet blandit. In imperdiet convallis nisl, in commodo magna mattis non. Nullam ac dolor quam. Nam tempus sapien diam, in tempor nisi gravida at. Ut ac convallis velit, sed tristique orci. Maecenas semper, magna eget mattis malesuada, orci tellus porta ipsum, sit amet hendrerit libero augue eget sem. Nunc non maximus est. Quisque nisl felis, ultricies pharetra eros sit amet, interdum auctor eros. Phasellus sed mi placerat, tempor diam nec, fermentum mi.",
    ],
  },
  {
    slug: "an-introduction-to-the-role-of-a-investapps-private-market-specialist1",
    type: "Guide",
    topic: "Private Market Education",
    title: "How Will the Tariff Sell–Off Hit Your Private Company Portfolio",
    dateISO: "2025-08-20",
    hero: "/images/news2.webp",
    content: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer eget neque at enim fringilla varius. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Proin feugiat dolor in lacus accumsan, ac porta lectus dapibus. Donec nisi tellus, ultrices eu dui eget, mattis gravida ipsum. In non nibh at lacus cursus aliquam. Duis commodo feugiat nibh, in auctor ante fermentum ut. Fusce tincidunt in augue vitae tempus. Sed elementum ligula id posuere ullamcorper.", 
      "Sed eget mauris congue purus aliquet blandit. In imperdiet convallis nisl, in commodo magna mattis non. Nullam ac dolor quam. Nam tempus sapien diam, in tempor nisi gravida at. Ut ac convallis velit, sed tristique orci. Maecenas semper, magna eget mattis malesuada, orci tellus porta ipsum, sit amet hendrerit libero augue eget sem. Nunc non maximus est. Quisque nisl felis, ultricies pharetra eros sit amet, interdum auctor eros. Phasellus sed mi placerat, tempor diam nec, fermentum mi.",
    ],
  },
  {
    slug: "investing-in-private-company-shares-a-guide-for-new-investors2",
    type: "Guide",
    topic: "Private Market Education",
    title: "Investing in private company shares: A guide for new investors",
    dateISO: "2025-08-06",
    hero: "/images/news1.webp",
    content: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer eget neque at enim fringilla varius. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Proin feugiat dolor in lacus accumsan, ac porta lectus dapibus. Donec nisi tellus, ultrices eu dui eget, mattis gravida ipsum. In non nibh at lacus cursus aliquam. Duis commodo feugiat nibh, in auctor ante fermentum ut. Fusce tincidunt in augue vitae tempus. Sed elementum ligula id posuere ullamcorper.", 
      "Sed eget mauris congue purus aliquet blandit. In imperdiet convallis nisl, in commodo magna mattis non. Nullam ac dolor quam. Nam tempus sapien diam, in tempor nisi gravida at. Ut ac convallis velit, sed tristique orci. Maecenas semper, magna eget mattis malesuada, orci tellus porta ipsum, sit amet hendrerit libero augue eget sem. Nunc non maximus est. Quisque nisl felis, ultricies pharetra eros sit amet, interdum auctor eros. Phasellus sed mi placerat, tempor diam nec, fermentum mi.",
    ],
  },
  {
    slug: "an-introduction-to-the-role-of-a-investapps-private-market-specialist4",
    type: "Guide",
    topic: "Private Market Education",
    title: "How Will the Tariff Sell–Off Hit Your Private Company Portfolio",
    dateISO: "2025-08-20",
    hero: "/images/news2.webp",
    content: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer eget neque at enim fringilla varius. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Proin feugiat dolor in lacus accumsan, ac porta lectus dapibus. Donec nisi tellus, ultrices eu dui eget, mattis gravida ipsum. In non nibh at lacus cursus aliquam. Duis commodo feugiat nibh, in auctor ante fermentum ut. Fusce tincidunt in augue vitae tempus. Sed elementum ligula id posuere ullamcorper.", 
      "Sed eget mauris congue purus aliquet blandit. In imperdiet convallis nisl, in commodo magna mattis non. Nullam ac dolor quam. Nam tempus sapien diam, in tempor nisi gravida at. Ut ac convallis velit, sed tristique orci. Maecenas semper, magna eget mattis malesuada, orci tellus porta ipsum, sit amet hendrerit libero augue eget sem. Nunc non maximus est. Quisque nisl felis, ultricies pharetra eros sit amet, interdum auctor eros. Phasellus sed mi placerat, tempor diam nec, fermentum mi.",
    ],
  },
  {
    slug: "investing-in-private-company-shares-a-guide-for-new-investors3",
    type: "Guide",
    topic: "Private Market Education",
    title: "Investing in private company shares: A guide for new investors",
    dateISO: "2025-08-06",
    hero: "/images/news1.webp",
    content: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer eget neque at enim fringilla varius. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Proin feugiat dolor in lacus accumsan, ac porta lectus dapibus. Donec nisi tellus, ultrices eu dui eget, mattis gravida ipsum. In non nibh at lacus cursus aliquam. Duis commodo feugiat nibh, in auctor ante fermentum ut. Fusce tincidunt in augue vitae tempus. Sed elementum ligula id posuere ullamcorper.", 
      "Sed eget mauris congue purus aliquet blandit. In imperdiet convallis nisl, in commodo magna mattis non. Nullam ac dolor quam. Nam tempus sapien diam, in tempor nisi gravida at. Ut ac convallis velit, sed tristique orci. Maecenas semper, magna eget mattis malesuada, orci tellus porta ipsum, sit amet hendrerit libero augue eget sem. Nunc non maximus est. Quisque nisl felis, ultricies pharetra eros sit amet, interdum auctor eros. Phasellus sed mi placerat, tempor diam nec, fermentum mi.",
    ],
  },
];

// A tiny related list just for demo
const RELATED = ARTICLES.filter((a) => a.slug !== "tariff-selloff-impact");

// ---------- Utilities ----------
const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
function fmt(iso: string) {
  try {
    return DATE_FMT.format(new Date(`${iso}T00:00:00Z`));
  } catch {
    return iso;
  }
}

// ---------- Components ----------
function MetaRow({ item }: { item: Article }) {
  return (
    <div className="flex items-center gap-3 text-xs text-themeTealLighter">
      <time suppressHydrationWarning dateTime={item.dateISO} className="inline-flex items-center gap-1">
        <CalendarDays className="h-3 w-3" /> {fmt(item.dateISO)}
      </time>
      <span>•</span>
      <span className="uppercase tracking-wide text-themeTealLighter">{item.type}</span>
    </div>
  );
}

function RightSidebar() {
  const highDemand = [
    { t: "ZC Tech shares up 12.5% today", ago: "3 hours ago" },
    { t: "Jo Finance up 8% today", ago: "6 hours ago" },
    { t: "Reaparts shares up 12.5% today", ago: "2 hours ago" },
    { t: "Alt Heat up 6% today", ago: "6 hours ago" },
  ];
  return (
    <aside className="space-y-6 lg:sticky lg:top-24">
      <div className="rounded bg-themeTealWhite p-4">
        <p className="text-themeTeal font-semibold mb-4 text-lg">High Demand Stocks</p>
        <ul className="space-y-2">
          {highDemand.map((d, i) => (
            <li key={i} className="text-md text-themeTeal">
                <div className="flex gap-2">
                    <TrendingUp width={20} height={20} className="text-green-700 mt-1" />
                    <div>
                        <div className="font-medium">{d.t}</div>
                        <div className="text-sm text-themeTealLighter">{d.ago}</div>
                    </div>
                </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded bg-themeTealWhite p-4">
        <p className="text-themeTeal font-semibold mb-4 text-lg">Related Insights</p>
        <ul className="space-y-4 divide-y divide-themeTealLighter">

            {RELATED.slice(0, 3).map((r, i) => (
            <li key={`${r.slug}-${i}`} className="py-4">
                <Link href={`/knowledge-center/${r.slug}`} className="block text-themeTeal hover:text-themeSkyBlue transition">
                    <span className="uppercase text-sm text-themeTealLighter">{r.type}</span>
                    <div className="text-md my-2 font-medium">{r.title}</div>
                    <div className="text-sm text-themeTealLight">{fmt(r.dateISO)}</div>
                </Link>
            </li>
            ))}
        </ul>
      </div>

      <div className="rounded bg-themeTeal p-5 text-themeTealWhite text-center">
        <p className="text-2xl mb-3">Talk to an Expert</p>
        <p className="text-5xl font-serif mb-4">Explore our personalized service</p>
        <Button text="Get in Touch" color="skyblue" variant="solid" size="md" href='/' className="rounded py-4"/>
      </div>
    </aside>
  );
}

// ---------- Page ----------
export default function KnowledgeDetailPage() {
  const route = useParams<{ slug: string | string[] }>();
  const slug = Array.isArray(route?.slug) ? route.slug[0] : (route?.slug as string | undefined);
  const article = useMemo(
    () => ARTICLES.find((a) => a.slug === slug) ?? ARTICLES[0],
    [slug]
  );

  const crumbs: Crumb[] = [
    { label: "Home", href: "/" },
    { label: "Knowledge Center", href: "/knowledge-center" },
    { label: article.title },
  ];

  const related: RelatedItem[] = useMemo(() => {
  const seen = new Set<string>();
  return ARTICLES
    .filter(a => a.slug !== article.slug && !seen.has(a.slug) && (seen.add(a.slug), true))
    .slice(0, 8)
    .map(({ slug, title, dateISO, hero, type }) => ({ slug, title, dateISO, hero, type }));
}, [article.slug]);


  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <div className="px-6 py-3">
        <Breadcrumbs items={crumbs} />
      </div>

      {/* Hero */}
      <section className="py-8 bg-themeTealWhite flex justify-center">
          <Image src={article.hero} alt={article.title} width={800} height={400} className="object-cover rounded" />
      </section>

      {/* Body + Sidebar */}
      <section className="appContainer py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <article className="lg:col-span-8">
            <MetaRow item={article} />
            <Heading as="h3" className="mt-2 mb-4 font-semibold text-themeTeal">{article.title}</Heading>

            <div className="text-themeTealLight">
                {/* remaining paragraphs */}
                {article.content.map((p, i) => (
                    <p key={i} className="mb-4">{p}</p>
                ))}
            </div>

          </article>

          <div className="lg:col-span-4">
            <RightSidebar />
          </div>
        </div>

        {/* Related */}
        <div className="mt-12">
            <RelatedCarousel items={related} />
        </div>
      </section>
    </main>
  );
}