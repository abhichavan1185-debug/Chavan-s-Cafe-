import React, { useState, useEffect } from "react";
import { useRestaurant } from "../context/RestaurantContext";
import {
  Volume2,
  VolumeX,
  PlusCircle,
  Clock,
  TrendingUp,
  Receipt,
  Store,
  Menu
} from "lucide-react";

export const TopNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    orders,
    tables,
    soundEnabled,
    setSoundEnabled,
    simulateIncomingOrder,
    setIsMobileMenuOpen
  } = useRestaurant();

  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalGrossSales = orders.reduce((sum, o) => sum + (o.status !== "Cancelled" ? o.grandTotal : 0), 0);
  const totalOrdersCount = orders.length;
  const occupiedTables = tables.filter((t) => t.status !== "available").length;

  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    pos: {
      title: "POS Billing Terminal",
      subtitle: "Dine-In, Takeaway & Parcel billing with thermal invoice"
    },
    storefront: {
      title: "Online Customer Menu",
      subtitle: "Customer-facing web menu, instant cart, and live tracking"
    },
    swiggy: {
      title: "Swiggy Merchant Hub",
      subtitle: "Real-time Swiggy partner dashboard • Accept & dispatch"
    },
    zomato: {
      title: "Zomato Partner Hub",
      subtitle: "Live Zomato order management • Valet tracking"
    },
    tracking: {
      title: "Live GPS Tracking",
      subtitle: "10-stage delivery lifecycle with animated route map"
    },
    fleet: {
      title: "Delivery Fleet",
      subtitle: "Rider dispatch, vehicle assignments, and availability"
    },
    kds: {
      title: "Kitchen Display (KDS)",
      subtitle: "Live cooking order tickets and bump bar"
    },
    tables: {
      title: "Table Service (1-15)",
      subtitle: "Real-time table occupancy and running bills"
    },
    analytics: {
      title: "Sales Analytics",
      subtitle: "Gross sales, platform revenue split, and reports"
    },
    inventory: {
      title: "Raw Inventory Ledger",
      subtitle: "Ingredient tracking and quick restocking"
    },
    crm: {
      title: "Customer CRM",
      subtitle: "Customer profiles, repeat visits and loyalty"
    },
    "menu-admin": {
      title: "Menu Master Catalog",
      subtitle: "168 dishes across 28 categories with stock toggles"
    },
    database: {
      title: "Database & Cloud Storage",
      subtitle: "Permanent data persistence, snapshots, and Supabase integration"
    }
  };

  const currentMeta = viewTitles[activeView] || {
    title: "Chavan's Cafe",
    subtitle: "Restaurant POS & Delivery Ecosystem"
  };

  return (
    <header className="h-16 bg-white border-b border-stone-200 px-3 sm:px-6 flex items-center justify-between flex-shrink-0 z-30 shadow-xs">
      {/* Left: Mobile Hamburger & Page Titles */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors flex items-center justify-center shrink-0"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-amber-900" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-stone-900 leading-tight truncate">
            {currentMeta.title}
          </h1>
          <p className="text-[10px] sm:text-xs text-stone-500 font-medium truncate hidden xs:block">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Center: Desktop Metrics Bar */}
      <div className="hidden xl:flex items-center gap-6 bg-stone-100/80 px-4 py-1.5 rounded-full border border-stone-200">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-700" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-bold text-stone-500">Gross Sales</span>
            <span className="text-xs font-mono font-bold text-amber-900">
              ₹{totalGrossSales.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-stone-300" />

        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-stone-600" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-bold text-stone-500">Total Orders</span>
            <span className="text-xs font-mono font-bold text-stone-900">{totalOrdersCount}</span>
          </div>
        </div>

        <div className="h-4 w-px bg-stone-300" />

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-bold text-stone-500">Tables Occupied</span>
            <span className="text-xs font-mono font-bold text-stone-900">{occupiedTables}/15</span>
          </div>
        </div>
      </div>

      {/* Right: Quick Action Utilities */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Live Clock (Hidden on small mobile) */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 rounded-lg border border-stone-200 text-stone-700 font-mono text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-stone-500" />
          <span>{currentTime || "--:--:--"}</span>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="w-9 h-9 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 flex items-center justify-center transition-colors shrink-0"
          title={soundEnabled ? "Mute notification sounds" : "Enable notification sounds"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-700" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
        </button>

        {/* Switch between POS and Customer Storefront */}
        {activeView !== "storefront" ? (
          <button
            onClick={() => setActiveView("storefront")}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs transition-colors shrink-0"
          >
            <Store className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Customer Menu</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveView("pos")}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-900 font-semibold text-xs transition-colors shrink-0"
          >
            <span>Staff POS</span>
          </button>
        )}

        {/* Simulate Order Button */}
        <button
          onClick={() => simulateIncomingOrder()}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs shadow-xs transition-all shrink-0"
          title="Simulate incoming order"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">+ Order</span>
        </button>
      </div>
    </header>
  );
};
