"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Filter, CalendarDays, BookOpenText, ChevronDown } from "lucide-react";
import Breadcrumbs, { type Crumb } from "@/components/subcomponents/breadcrumbs";
import { Heading } from "@/components/ui";
import Image from "next/image";

// ------ Types ------
export interface KnowledgeCenter {
  id: number;
  slug: string;
  is_featured: boolean;
  title: string;
  blog_image: string;
  teaser: string;
  summary: string;
  content_type: 'TEXT' | 'VIDEO';
  first_part?: string;
  second_part?: string;
  video_file?: string;
  knowledge_sector_id?: number;
  knowledge_subsector_ids?: string;
  knowledge_topic_id?: number;
  knowledge_subtopic_ids?: string;
  knowledge_theme_id?: number;
  company_ids?: string;
  KnowledgeSector?: { id: number; name: string };
  KnowledgeTopic?: { id: number; name: string };
  KnowledgeTheme?: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

export interface KnowledgeTopic {
  id: number;
  name: string;
  is_active: boolean;
}

export interface KnowledgeSubtopic {
  id: number;
  name: string;
  knowledge_topic_id: number;
  is_active: boolean;
}

// ------ Utilities ------
const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric", 
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(iso: string) {
  try {
    // Handle both date-only and full ISO strings
    const date = iso.includes('T') ? new Date(iso) : new Date(`${iso}T00:00:00Z`);
    return DATE_FMT.format(date);
  } catch {
    return iso;
  }
}

// ------ UI Parts ------
function Card({ item }: { item: KnowledgeCenter }) {
  return (
    <a
      href={`/knowledge-center/${item.slug}`}
      className="group block rounded overflow-hidden"
    >
      <div className="overflow-hidden">
        <Image
          src={item.blog_image}
          alt={item.title}
          width={1200}
          height={600}
          className="h-full w-full object-cover group-hover:scale-[1.02] transition"
        />
      </div>
      <div className="py-4">
        <div className="text-xs uppercase tracking-wide text-themeTealLighter flex items-center gap-2">
          <BookOpenText className="h-3.5 w-3.5" />
          <span>{item.content_type === 'TEXT' ? 'Article' : 'Guide'}</span>
        </div>
        <h3 className="mt-2 text-xl font-semibold text-themeTeal group-hover:text-themeSkyBlue transition duration-500">
          {item.title}
        </h3>
        <div className="mt-2 flex items-center gap-2 text-sm text-themeTealLighter">
          <CalendarDays className="h-3 w-3" />
          <time dateTime={item.created_at}>
            {formatDate(item.created_at)}
          </time>
        </div>
      </div>
    </a>
  );
}

// ------ Page ------
export default function KnowledgeCenterPage() {
  const [knowledgeCenters, setKnowledgeCenters] = useState<KnowledgeCenter[]>([]);
  const [featuredCenters, setFeaturedCenters] = useState<KnowledgeCenter[]>([]);
  const [topics, setTopics] = useState<KnowledgeTopic[]>([]);
  const [subtopics, setSubtopics] = useState<KnowledgeSubtopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [sortLatest, setSortLatest] = useState(true);
  const [page, setPage] = useState(1);
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [showSubtopicDropdown, setShowSubtopicDropdown] = useState(false);
  const pageSize = 11;

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [centersRes, featuredRes, topicsRes, subtopicsRes] = await Promise.all([
          fetch('/api/knowledge-centers'),
          fetch('/api/knowledge-centers/featured'),
          fetch('/api/knowledge-topics'),
          fetch('/api/knowledge-subtopics')
        ]);

        const [centersData, featuredData, topicsData, subtopicsData] = await Promise.all([
          centersRes.json(),
          featuredRes.json(),
          topicsRes.json(),
          subtopicsRes.json()
        ]);

        if (centersData.success) {
          setKnowledgeCenters(centersData.data);
        }
        if (featuredData.success) {
          setFeaturedCenters(featuredData.data);
        }
        if (topicsData.success) {
          setTopics(topicsData.data);
        }
        if (subtopicsData.success) {
          setSubtopics(subtopicsData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter centers based on selected topic/subtopic and search
  const filteredCenters = useMemo(() => {
    let filtered = knowledgeCenters;

    // Filter by topic
    if (selectedTopic) {
      filtered = filtered.filter(center => center.knowledge_topic_id === selectedTopic);
    }

    // Filter by subtopic
    if (selectedSubtopic) {
      filtered = filtered.filter(center => {
        const subtopicIds = center.knowledge_subtopic_ids ? JSON.parse(center.knowledge_subtopic_ids) : [];
        return subtopicIds.includes(selectedSubtopic);
      });
    }

    // Filter by search
    if (q.trim()) {
      const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
      filtered = filtered.filter(center =>
        words.every(word => 
          center.title.toLowerCase().includes(word) ||
          center.summary.toLowerCase().includes(word) ||
          center.teaser.toLowerCase().includes(word)
        )
      );
    }

    // Sort by date
    filtered.sort((a, b) => 
      sortLatest 
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return filtered;
  }, [knowledgeCenters, selectedTopic, selectedSubtopic, q, sortLatest]);

  const totalPages = Math.max(1, Math.ceil(filteredCenters.length / pageSize));
  const pageItems = filteredCenters.slice((page - 1) * pageSize, page * pageSize);

  const crumbs: Crumb[] = [
    { label: "Home", href: "/" },
    { label: "Knowledge Center" }
  ];

  useEffect(() => {
    setPage(1);
  }, [selectedTopic, selectedSubtopic, q, sortLatest]);

  // Get subtopics for selected topic
  const availableSubtopics = useMemo(() => {
    if (!selectedTopic) return [];
    return subtopics.filter(subtopic => subtopic.knowledge_topic_id === selectedTopic);
  }, [subtopics, selectedTopic]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowTopicDropdown(false);
      setShowSubtopicDropdown(false);
    };
    
    if (showTopicDropdown || showSubtopicDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showTopicDropdown, showSubtopicDropdown]);

  return (
    <main className="min-h-screen">
        <div className="px-6 py-3 bg-themeTealWhite">
            <Breadcrumbs items={crumbs} />
        </div>
      {/* Controls */}
      <div className="appContainer py-10 md:py-16">
        <section className="mb-10">
          {/* Hierarchical Topic Dropdowns */}
          <div className="mt-4 flex flex-wrap gap-3">
            {/* Topic Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTopicDropdown(!showTopicDropdown)}
                className="flex items-center gap-2 rounded border px-3 py-2 text-sm transition duration-500 cursor-pointer border-themeTealLighter text-themeTealLighter hover:border-themeTeal hover:bg-themeTeal hover:text-themeTealWhite"
              >
                <span>{selectedTopic ? topics.find(t => t.id === selectedTopic)?.name : "All Topics"}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showTopicDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 rounded border border-themeTealLighter bg-white shadow-lg z-10">
                  <button
                    onClick={() => {
                      setSelectedTopic(null);
                      setSelectedSubtopic(null);
                      setShowTopicDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-themeTealWhite"
                  >
                    All Topics
                  </button>
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setSelectedTopic(topic.id);
                        setSelectedSubtopic(null);
                        setShowTopicDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-themeTealWhite"
                    >
                      {topic.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subtopic Dropdown */}
            {selectedTopic && availableSubtopics.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowSubtopicDropdown(!showSubtopicDropdown)}
                  className="flex items-center gap-2 rounded border px-3 py-2 text-sm transition duration-500 cursor-pointer border-themeTealLighter text-themeTealLighter hover:border-themeTeal hover:bg-themeTeal hover:text-themeTealWhite"
                >
                  <span>{selectedSubtopic ? subtopics.find(s => s.id === selectedSubtopic)?.name : "All Subtopics"}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showSubtopicDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 rounded border border-themeTealLighter bg-white shadow-lg z-10">
                    <button
                      onClick={() => {
                        setSelectedSubtopic(null);
                        setShowSubtopicDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-themeTealWhite"
                    >
                      All Subtopics
                    </button>
                    {availableSubtopics.map((subtopic) => (
                      <button
                        key={subtopic.id}
                        onClick={() => {
                          setSelectedSubtopic(subtopic.id);
                          setShowSubtopicDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-themeTealWhite"
                      >
                        {subtopic.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

            <div className="mt-4 flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-themeTealLight" />
                <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search here..."
                className="w-full rounded text-themeTeal pl-10 pr-3 py-2.5 outline-none ring-1 ring-themeTealLighter focus:ring-themeTeal transition duration-500"
                />
            </div>
            <div className="flex gap-2 text-white">
                <button
                onClick={() => setSortLatest((v) => !v)}
                className="inline-flex items-center gap-2 rounded bg-themeTeal px-4 py-3 text-sm hover:bg-themeSkyBlue cursor-pointer transition duration-500"
                title="Toggle sort order"
                >
                <Filter className="h-4 w-4" />
                {sortLatest ? "Latest" : "Oldest"}
                </button>
                <button
                onClick={() => {
                    setQ("");
                    setSelectedTopic(null);
                    setSelectedSubtopic(null);
                    setSortLatest(true);
                }}
                className="rounded bg-themeTeal px-3 py-2 text-sm hover:bg-themeSkyBlue cursor-pointer transition duration-500"
                >
                Reset
                </button>
            </div>
            </div>
        </section>

        {/* Featured band */}
        <section className="mb-10">
          <Heading as="h4" className="mb-4 font-semibold">
            Featured Knowledge Center
          </Heading>

          {loading ? (
            <div className="text-center py-8 text-themeTealLighter">Loading...</div>
          ) : featuredCenters.length === 0 ? (
            <div className="text-center py-8 text-themeTealLighter">No featured content available</div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCenters.map((item) => (
                <Card key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* Grid */}
        <section>
            <Heading as="h4" className="mt-4 mb-4 font-semibold">All Knowledge Center</Heading>

            {loading ? (
                <div className="text-center py-8 text-themeTealLighter">Loading...</div>
            ) : pageItems.length === 0 ? (
            <p className="text-themeTealLighter">No results. Adjust filters.</p>
            ) : (
            <>
                {/* First row: exactly two columns */}
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                {pageItems.slice(0, 2).map((item) => (
                    <div key={item.id} className="col-span-1">
                    <Card item={item} />
                    </div>
                ))}
                </div>

                {/* Remaining rows: 3-up on large, 2-up on tablet, 1-up on mobile */}
                {pageItems.length > 2 && (
                <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {pageItems.slice(2).map((item) => (
                    <div key={item.id} className="col-span-1">
                        <Card item={item} />
                    </div>
                    ))}
                </div>
                )}
            </>
            )}

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between text-white">
            <p className="text-sm text-themeTealLighter">
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, filteredCenters.length)} of {filteredCenters.length}
            </p>
            <div className="flex gap-2">
                <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded cursor-pointer bg-themeTeal px-3 py-2 text-sm disabled:bg-themeTealLighter disabled:cursor-not-allowed"
                >
                Prev
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={
                    "h-9 w-9 rounded border text-sm cursor-pointer transition duration-500 " +
                    (page === i + 1
                        ? "border-themeTeal bg-themeTeal text-themeTealWhite"
                        : "border-themeTealLighter text-themeTealLighter hover:bg-themeTeal hover:text-themeTealWhite")
                    }
                >
                    {i + 1}
                </button>
                ))}
                <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md bg-themeTeal cursor-pointer px-3 py-2 text-sm disabled:bg-themeTealLighter disabled:cursor-not-allowed"
                >
                Next
                </button>
            </div>
            </div>
        </section>
      </div>
    </main>
  );
}
