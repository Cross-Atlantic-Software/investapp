"use client";

import { useState, useEffect } from "react";
import { FileText, Download, ExternalLink } from "lucide-react";

interface HomeInsight {
  id: number;
  title: string;
  file: string;
  created_at: string;
  updated_at: string;
}

export default function HomeInsights() {
  const [homeInsights, setHomeInsights] = useState<HomeInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeInsights = async () => {
      try {
        const response = await fetch("/api/home-insights");
        const data = await response.json();

        if (data.success) {
          setHomeInsights(data.data.homeInsights || []);
        }
      } catch (error) {
        console.error("Error fetching home insights:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeInsights();
  }, []);

  if (loading) {
    return (
      <section className="appContainer py-8">
        <div className="text-center text-gray-500">Loading insights...</div>
      </section>
    );
  }

  if (homeInsights.length === 0) {
    return null; // Don't render if no insights
  }

  return (
    <section className="appContainer py-8 md:py-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Home Insights</h2>
        <p className="mt-2 text-gray-600">Access our latest insights and resources</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {homeInsights.map((insight) => {
          // Determine file type and icon
          const fileExtension = insight.file.split('.').pop()?.toLowerCase();
          const isPdf = fileExtension === 'pdf';
          const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '');

          return (
            <div
              key={insight.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-themeTeal/10">
                  <FileText className="h-6 w-6 text-themeTeal" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(insight.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {isImage ? (
                  <a
                    href={insight.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-md bg-themeTeal px-4 py-2 text-sm font-medium text-white hover:bg-themeTeal/90"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Image
                  </a>
                ) : (
                  <a
                    href={insight.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-md bg-themeTeal px-4 py-2 text-sm font-medium text-white hover:bg-themeTeal/90"
                  >
                    <Download className="h-4 w-4" />
                    {isPdf ? 'View PDF' : 'Download'}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

