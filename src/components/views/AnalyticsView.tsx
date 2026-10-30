import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import {
  TrendingUp,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Sparkles
} from "lucide-react";

export const AnalyticsView: React.FC = () => {
  const { orders } = useRestaurant();
  const [timeRange, setTimeRange] = useState<"Today" | "Yesterday" | "This Week" | "This Month">("Today");

  // Aggregations
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "Delivered").length;
  const pendingOrders = orders.filter(
    (o) => o.status !== "Delivered" && o.status !== "Cancelled"
  ).length;
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled").length;

  const grossSales = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + o.grandTotal, 0);

  const aov = totalOrders > 0 ? +(grossSales / (totalOrders - cancelledOrders || 1)).toFixed(2) : 0;

  // Platform Breakdown
  const posSales = orders
    .filter((o) => o.platform === "POS" && o.status !== "Cancelled")
    .reduce((s, o) => s + o.grandTotal, 0);

  const swiggySales = orders
    .filter((o) => o.platform === "Swiggy" && o.status !== "Cancelled")
    .reduce((s, o) => s + o.grandTotal, 0);

  const zomatoSales = orders
    .filter((o) => o.platform === "Zomato" && o.status !== "Cancelled")
    .reduce((s, o) => s + o.grandTotal, 0);

  const onlineSales = orders
    .filter((o) => o.platform === "Customer-Online" && o.status !== "Cancelled")
    .reduce((s, o) => s + o.grandTotal, 0);

  const posOrdersCount = orders.filter((o) => o.platform === "POS").length;
  const swiggyOrdersCount = orders.filter((o) => o.platform === "Swiggy").length;
  const zomatoOrdersCount = orders.filter((o) => o.platform === "Zomato").length;
  const onlineOrdersCount = orders.filter((o) => o.platform === "Customer-Online").length;

  return (
    <div className="p-6 bg-stone-100 flex-1 overflow-y-auto space-y-6">
      {/* Analytics Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Restaurant Analytics & Sales Ledger
            </h3>
            <p className="text-xs text-stone-500">
              Real-time platform revenue split, average order values, and dish sales ranking
            </p>
          </div>
        </div>

        {/* Date switcher */}
        <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-bold border border-stone-200">
          {(["Today", "Yesterday", "This Week", "This Month"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === range
                  ? "bg-amber-800 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Grid (5 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-[10px] uppercase font-bold text-stone-500 flex items-center justify-between">
            <span>Gross Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-mono font-black text-amber-950">
            ₹{grossSales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-emerald-700 font-semibold">+18.4% vs last week</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-[10px] uppercase font-bold text-stone-500 flex items-center justify-between">
            <span>Total Orders</span>
            <Receipt className="w-4 h-4 text-stone-600" />
          </div>
          <div className="text-xl font-mono font-black text-stone-900">{totalOrders}</div>
          <p className="text-[10px] text-stone-500 font-medium">All active channels</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-[10px] uppercase font-bold text-stone-500 flex items-center justify-between">
            <span>Average Order Value</span>
            <DollarSign className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-xl font-mono font-black text-stone-900">₹{aov}</div>
          <p className="text-[10px] text-stone-500 font-medium">AOV across channels</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-[10px] uppercase font-bold text-stone-500 flex items-center justify-between">
            <span>Completed Orders</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-mono font-black text-emerald-700">{completedOrders}</div>
          <p className="text-[10px] text-stone-500 font-medium">{pendingOrders} currently active</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-[10px] uppercase font-bold text-stone-500 flex items-center justify-between">
            <span>Cancelled</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-xl font-mono font-black text-red-600">{cancelledOrders}</div>
          <p className="text-[10px] text-stone-500 font-medium">0.8% return rate</p>
        </div>
      </div>

      {/* Platform Channel Performance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* POS Dine-In */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-stone-800">Walk-in POS</span>
            <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
              {posOrdersCount} orders
            </span>
          </div>
          <div className="text-lg font-mono font-black text-stone-900">₹{posSales.toFixed(2)}</div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-800 h-full"
              style={{ width: `${(posSales / (grossSales || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Swiggy */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#fc8019]">Swiggy</span>
            <span className="text-[10px] font-mono font-bold bg-orange-100 text-[#fc8019] px-2 py-0.5 rounded-full">
              {swiggyOrdersCount} orders
            </span>
          </div>
          <div className="text-lg font-mono font-black text-[#fc8019]">
            ₹{swiggySales.toFixed(2)}
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#fc8019] h-full"
              style={{ width: `${(swiggySales / (grossSales || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Zomato */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#e23744]">Zomato</span>
            <span className="text-[10px] font-mono font-bold bg-red-100 text-[#e23744] px-2 py-0.5 rounded-full">
              {zomatoOrdersCount} orders
            </span>
          </div>
          <div className="text-lg font-mono font-black text-[#e23744]">
            ₹{zomatoSales.toFixed(2)}
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#e23744] h-full"
              style={{ width: `${(zomatoSales / (grossSales || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Customer Online */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-700">Online Storefront</span>
            <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              {onlineOrdersCount} orders
            </span>
          </div>
          <div className="text-lg font-mono font-black text-emerald-800">
            ₹{onlineSales.toFixed(2)}
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full"
              style={{ width: `${(onlineSales / (grossSales || 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Charts Grid: Hourly Sales Trend & Top Dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Rush Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
              Hourly Sales Volume (Peak Rushes)
            </h4>
            <span className="text-[10px] text-stone-500 font-medium">9 AM to 11 PM</span>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-56 flex items-end justify-between gap-2 pt-6 px-2">
            {[
              { time: "9 AM", val: 35 },
              { time: "11 AM", val: 75 },
              { time: "1 PM", val: 140 },
              { time: "3 PM", val: 60 },
              { time: "5 PM", val: 120 },
              { time: "7 PM", val: 180 },
              { time: "9 PM", val: 160 },
              { time: "11 PM", val: 45 }
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[9px] font-mono font-bold text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{bar.val * 35}
                </span>
                <div
                  className="w-full bg-amber-700/80 hover:bg-amber-800 rounded-t-lg transition-all"
                  style={{ height: `${(bar.val / 180) * 80}%` }}
                />
                <span className="text-[10px] text-stone-500 font-mono">{bar.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Dishes (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
              Top Selling Dishes
            </h4>
            <span className="text-[10px] font-bold text-amber-700">By Popularity</span>
          </div>

          <div className="space-y-3">
            {[
              { name: "Special Irani Chai", orders: 184, cat: "Tea & Coffee" },
              { name: "Chicken Dum Biryani", orders: 92, cat: "Biryani" },
              { name: "Classic Cold Coffee", orders: 78, cat: "Cold Coffee" },
              { name: "Sizzling Brownie", orders: 64, cat: "Desserts" },
              { name: "Butter Masala Dosa", orders: 59, cat: "South Indian" }
            ].map((dish, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-stone-900">
                  <span>{i + 1}. {dish.name}</span>
                  <span className="font-mono text-stone-500">{dish.orders} sold</span>
                </div>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full"
                    style={{ width: `${(dish.orders / 184) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
