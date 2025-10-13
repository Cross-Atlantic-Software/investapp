"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";

type QA = { q: string; a: string; defaultOpen?: boolean; id?: number };

type FaqData = {
  id: number;
  stock_id: number;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function FaqSection({ 
  items, 
  stockId 
}: { 
  items?: QA[]; 
  stockId?: number;
}) {
  const [faqItems, setFaqItems] = useState<QA[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFaqItems = useCallback(async () => {
    if (!stockId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/stocks/${stockId}/faqs`);
      const result = await response.json();
      
      if (result.success && result.data?.faqs) {
        // Sort FAQs by display_order to ensure proper ordering
        const sortedFaqs = result.data.faqs.sort((a: FaqData, b: FaqData) => a.display_order - b.display_order);
        
        const formattedItems: QA[] = sortedFaqs.map((item: FaqData) => ({
          q: item.question,
          a: item.answer,
          defaultOpen: false,
          id: item.id // Add ID for better React key
        }));
        setFaqItems(formattedItems);
      } else {
        setFaqItems([]);
      }
    } catch (err) {
      console.error('Error loading FAQ items:', err);
      setError('Failed to load FAQ items');
      setFaqItems([]);
    } finally {
      setLoading(false);
    }
  }, [stockId]);

  useEffect(() => {
    if (items) {
      // Use provided items if available
      setFaqItems(items);
    } else if (stockId) {
      // Load from database if stockId is provided
      loadFaqItems();
    } else {
      // Fallback to default content if no stockId and no items
      setFaqItems(DEFAULT_QA);
    }
  }, [stockId, items, loadFaqItems]);

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-3">
        <div className="text-center py-8 text-red-600">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (faqItems.length === 0) {
    return (
      <div className="space-y-3">
        <div className="text-center py-8 text-gray-500">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">
            {stockId ? "No FAQs available for this stock." : "No FAQs available at the moment."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {faqItems.map((it, i) => (
        <FaqItem key={it.id || i} {...it} defaultOpen={i === 0} />
      ))}
    </div>
  );
}

function FaqItem({ q, a, defaultOpen = false }: QA) {
  const [open, setOpen] = useState(defaultOpen);
  const [maxH, setMaxH] = useState(0);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (innerRef.current) setMaxH(innerRef.current.scrollHeight);
  }, [a]);

  return (
    <div className="rounded border border-themeTealLighter bg-white">
      <button
        type="button"
        className="w-full flex items-start justify-between gap-3 px-3 py-3 text-left"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-sky-600" />
          <span className="font-semibold text-themeTeal">{q}</span>
        </div>
        {open ? (
          <Minus className="h-5 w-5 text-themeTealLight cursor-pointer" />
        ) : (
          <Plus className="h-5 w-5 text-themeTeal cursor-pointer" />
        )}
      </button>

      <div
        className="overflow-hidden border-t border-themeTealLighter transition-[max-height,opacity] duration-300 ease-out"
        style={{ maxHeight: open ? maxH : 0, opacity: open ? 1 : 0 }}
      >
        <div ref={innerRef} className="px-3 py-3 text-themeTealLight">
          {a}
        </div>
      </div>
    </div>
  );
}

/* demo content */
const DEFAULT_QA: QA[] = [
  {
    q: "How are Invest App prices calculated?",
    a: "They reflect recent matched trades and indicative quotes from verified counterparties.",
  },
  {
    q: "What is the settlement period?",
    a: "The expected settlement date is shown on the Buy tab and depends on the company’s registrar workflow.",
  },
  {
    q: "Is there a minimum order size?",
    a: "Orders must meet both Min. Units and Lot Size shown on the trade card.",
  },
  {
    q: "Can I cancel an order?",
    a: "Open orders can be withdrawn anytime before they match. Matched trades move to settlement and cannot be cancelled.",
  },
];
