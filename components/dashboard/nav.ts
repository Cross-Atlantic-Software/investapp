// components/dashboard/nav.ts
import {
  LayoutDashboard, Briefcase, BarChart3,
  Building, Download, TrendingUp, Wallet, Settings, TrendingDown
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = { id: string; label: string; href: string; icon: LucideIcon };
export type NavGroup = { title: string; items: NavItem[] };

export const GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { id:"dashboard", label:"Dashboard", href:"/dashboard", icon:LayoutDashboard },
      { id:"portfolio", label:"Portfolio", href:"/dashboard/portfolio", icon:Briefcase },
      { id:"analytics", label:"Analytics", href:"/dashboard/analytics", icon:BarChart3 },
    ],
  },
  {
    title: "Trading",
    items: [
      { id:"holdings", label:"Holdings", href:"/dashboard/holdings", icon:Building },
      { id:"sell", label:"Sell Requests", href:"/dashboard/sell-requests", icon:TrendingDown },
      { id:"watchlist", label:"Watchlist", href:"/dashboard/watchlist", icon:TrendingUp },
      { id:"tx", label:"Transactions", href:"/dashboard/transactions", icon:Wallet },
    ],
  },
  {
    title: "Account",
    items: [
      { id:"funds", label:"Funds", href:"/dashboard/funds", icon:Wallet },
      { id:"reports", label:"Reports", href:"/dashboard/reports", icon:Download },
      { id:"settings", label:"Settings", href:"/dashboard/settings", icon:Settings },
    ],
  },
];
