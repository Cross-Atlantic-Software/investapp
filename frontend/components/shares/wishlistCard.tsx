"use client";

import { Heart } from "lucide-react";
import { Heading } from "../ui";

export default function WishlistCard({
  name,
  sector,
  priceINR,
  onAdd,
}: {
  name: string;
  sector: string;
  priceINR: number;
  onAdd?: () => void;
}) {
  return (
    <aside className="rounded-md bg-white p-5">
      <Heading as="h5" className="mb-3 leading-6 text-themeTeal font-semibold">Wishlist</Heading>

      <div className="flex items-start justify-between border-t border-themeTealLighter pt-4">
        <div>
          <div className="font-semibold text-themeTeal">{name}</div>
          <div className="text-sm text-themeTealLight">{sector}</div>
        </div>
        <div className="font-semibold text-themeTeal">₹ {formatINR(priceINR)}</div>
      </div>

      {/* <button
        type="button"
        onClick={onAdd}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-md bg-themeTeal px-4 py-2 font-semibold text-white hover:bg-themeSkyBlue transition duration-500 cursor-pointer"
      >
        Add to Wishlist <Heart className="h-4 w-4" />
      </button> */}
    </aside>
  );
}

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
