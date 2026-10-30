import React from "react";
import { useRestaurant } from "../context/RestaurantContext";
import {
  Calculator,
  ShoppingBag,
  Bike,
  UtensilsCrossed,
  MapPin,
  Users2,
  ChefHat,
  LayoutGrid,
  BarChart3,
  Boxes,
  Contact2,
  BookOpen,
  Coffee,
  CircleDot,
  X,
  Database
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    orders,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useRestaurant();

  const swiggyCount = orders.filter(
    (o) => o.platform === "Swiggy" && o.status !== "Delivered" && o.status !== "Cancelled"
  ).length;

  const zomatoCount = orders.filter(
    (o) => o.platform === "Zomato" && o.status !== "Delivered" && o.status !== "Cancelled"
  ).length;

  const kdsCount = orders.filter(
    (o) => o.status === "Cooking" || o.status === "Accepted"
  ).length;

  const handleNavClick = (view: string) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs animate-in fade-in duration-150"
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 bg-gradient-to-b from-[#2b1102] via-[#451a03] to-[#78350f] text-amber-50 flex flex-col flex-shrink-0 shadow-2xl select-none border-r border-amber-900/40 transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-amber-500/20 bg-black/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 p-2 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Coffee className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-xl font-black tracking-wide text-white drop-shadow-sm">
                  CHAVAN'S
                </span>
                <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
                  CAFE
                </span>
              </div>
              <p className="text-[10px] text-amber-200/80 font-medium tracking-tight">
                Fresh Taste. Happy Moments.
              </p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-2.5 py-3 overflow-y-auto space-y-4">
          {/* Sales & Ordering */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold text-amber-300/50 tracking-wider uppercase">
              Sales & Ordering
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick("pos")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "pos"
                    ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Calculator className={`w-4 h-4 ${activeView === "pos" ? "text-stone-950" : "text-amber-400"}`} />
                <span>POS Billing Terminal</span>
              </button>

              <button
                onClick={() => handleNavClick("storefront")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "storefront"
                    ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <ShoppingBag className={`w-4 h-4 ${activeView === "storefront" ? "text-stone-950" : "text-amber-400"}`} />
                <span>Customer Online Ordering</span>
                <span className="ml-auto bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  Live
                </span>
              </button>
            </div>
          </div>

          {/* Delivery Integrations */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold text-amber-300/50 tracking-wider uppercase">
              Delivery Aggregators
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick("swiggy")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "swiggy"
                    ? "bg-[#fc8019] text-white font-bold shadow-md shadow-[#fc8019]/30"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Bike className={`w-4 h-4 ${activeView === "swiggy" ? "text-white" : "text-[#fc8019]"}`} />
                <span>Swiggy Orders</span>
                {swiggyCount > 0 && (
                  <span className="ml-auto bg-[#fc8019] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-white/20">
                    {swiggyCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick("zomato")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "zomato"
                    ? "bg-[#e23744] text-white font-bold shadow-md shadow-[#e23744]/30"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <UtensilsCrossed className={`w-4 h-4 ${activeView === "zomato" ? "text-white" : "text-[#e23744]"}`} />
                <span>Zomato Orders</span>
                {zomatoCount > 0 && (
                  <span className="ml-auto bg-[#e23744] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-white/20">
                    {zomatoCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick("tracking")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "tracking"
                    ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <MapPin className={`w-4 h-4 ${activeView === "tracking" ? "text-stone-950" : "text-amber-400"}`} />
                <span>Live Delivery Tracking</span>
                <span className="ml-auto flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </button>

              <button
                onClick={() => handleNavClick("fleet")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "fleet"
                    ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Users2 className={`w-4 h-4 ${activeView === "fleet" ? "text-stone-950" : "text-amber-400"}`} />
                <span>Delivery Fleet</span>
              </button>
            </div>
          </div>

          {/* Restaurant Operations */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold text-amber-300/50 tracking-wider uppercase">
              Kitchen & Service
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick("kds")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "kds"
                    ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <ChefHat className={`w-4 h-4 ${activeView === "kds" ? "text-stone-950" : "text-amber-400"}`} />
                <span>Kitchen Display (KDS)</span>
                {kdsCount > 0 && (
                  <span className="ml-auto bg-amber-400 text-stone-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {kdsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick("tables")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "tables"
                    ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <LayoutGrid className={`w-4 h-4 ${activeView === "tables" ? "text-stone-950" : "text-amber-400"}`} />
                <span>Table Management (1-15)</span>
              </button>
            </div>
          </div>

          {/* Management & Catalog */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold text-amber-300/50 tracking-wider uppercase">
              Store Administration
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick("analytics")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "analytics"
                    ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <BarChart3 className={`w-4 h-4 ${activeView === "analytics" ? "text-stone-950" : "text-amber-400"}`} />
                <span>Sales Analytics</span>
              </button>

              <button
                onClick={() => handleNavClick("inventory")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "inventory"
                    ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Boxes className={`w-4 h-4 ${activeView === "inventory" ? "text-stone-950" : "text-amber-400"}`} />
                <span>Raw Stock Inventory</span>
              </button>

              <button
                onClick={() => handleNavClick("crm")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "crm"
                    ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Contact2 className={`w-4 h-4 ${activeView === "crm" ? "text-stone-950" : "text-amber-400"}`} />
                <span>Customer CRM</span>
              </button>

              <button
                onClick={() => handleNavClick("menu-admin")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "menu-admin"
                    ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <BookOpen className={`w-4 h-4 ${activeView === "menu-admin" ? "text-stone-950" : "text-amber-400"}`} />
                <span>Menu Master Catalog</span>
              </button>

              <button
                onClick={() => handleNavClick("database")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "database"
                    ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Database className={`w-4 h-4 ${activeView === "database" ? "text-stone-950" : "text-amber-400"}`} />
                <span>Database & Cloud Sync</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Commercial Footer */}
        <div className="p-3 bg-black/30 border-t border-amber-500/10 text-[11px] text-amber-200/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium text-emerald-400">
              <CircleDot className="w-3 h-3 fill-emerald-400 animate-pulse" />
              <span>POS System Online</span>
            </div>
            <span className="text-[10px] text-amber-400/80 font-mono font-bold">Chavan's OS</span>
          </div>
        </div>
      </aside>
    </>
  );
};
