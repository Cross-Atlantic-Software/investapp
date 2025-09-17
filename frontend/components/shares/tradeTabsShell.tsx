"use client";

import TradeTabs from "./buySell";

type Props = {
  company: string;
  priceINR: number;
  settlementDate: string;
  minUnits?: number;
  lotSize?: number;
};

export default function TradeTabsShell(props: Props) {
  const handleBuy = (p: { quantity: number; investINR: number }) => {
    console.log("buy", p);
    // TODO: call API / show toast
  };

  const handleSell = (p: { quantity: number; sellingPriceINR: number; message?: string }) => {
    console.log("sell", p);
    // TODO: call API / show toast
  };

  return (
    <TradeTabs
      {...props}
      onBuySubmit={handleBuy}
      onSellSubmit={handleSell}
    />
  );
}
