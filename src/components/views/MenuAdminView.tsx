import React, { useState, useMemo, useEffect } from "react";
import { MENU_ITEMS, ALL_CATEGORIES, FALLBACK_FOOD_IMAGE } from "../../data/menuData";
import { CategoryName } from "../../types";
import { BookOpen, Search, Sparkles, Clock, CheckCircle2, XCircle } from "lucide-react";

export const MenuAdminView: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<CategoryName | "All">("All");
  const [search, setSearch] = useState<string>("");
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("chavans_menu_availability");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const map: Record<string, boolean> = {};
    MENU_ITEMS.forEach((i) => {
      map[i.id] = i.isAvailable;
    });
    return map;
  });

  useEffect(() => {
    localStorage.setItem("chavans_menu_availability", JSON.stringify(availabilityMap));
  }, [availabilityMap]);

  const filtered = useMemo(() => {
    return MENU_ITEMS.filter((i) => {
      const matchCat = selectedCat === "All" || i.category === selectedCat;
      const matchSearch =
        search.trim() === "" ||
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCat, search]);

  const toggleAvailability = (id: string) => {
    setAvailabilityMap((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="p-6 bg-stone-100 flex-1 overflow-y-auto space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <BookOpen className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Master Menu Catalog (168 Dishes • 28 Categories)
            </h3>
            <p className="text-xs text-stone-500">
              Product registry, pricing management, preparation timings, and live kitchen availability toggles
            </p>
          </div>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog dishes..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:bg-white"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedCat("All")}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            selectedCat === "All"
              ? "bg-amber-800 text-white shadow-xs"
              : "bg-white text-stone-700 hover:bg-stone-200 border border-stone-200"
          }`}
        >
          All (168)
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCat === cat
                ? "bg-amber-800 text-white shadow-xs"
                : "bg-white text-stone-700 hover:bg-stone-200 border border-stone-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table Catalog */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Dish / Photo</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Diet</th>
                <th className="px-5 py-3">Price (INR)</th>
                <th className="px-5 py-3">Prep Time</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3 text-right">Kitchen Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
              {filtered.map((item) => {
                const isAvail = availabilityMap[item.id] !== false;

                return (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-5 py-3 flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
                        }}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                      />
                      <div>
                        <div className="font-bold text-stone-900 flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.isBestseller && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                              Bestseller
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">ID: {item.id}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-stone-600 font-semibold">{item.category}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          item.isVeg ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.isVeg ? "bg-emerald-600" : "bg-red-600"
                          }`}
                        />
                        <span>{item.isVeg ? "Veg" : "Non-Veg"}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono font-bold text-stone-900">₹{item.price}</td>
                    <td className="px-5 py-3 text-stone-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{item.prepTime}</span>
                    </td>
                    <td className="px-5 py-3 font-bold text-amber-600">★ {item.rating}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => toggleAvailability(item.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                          isAvail
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                            : "bg-red-50 text-red-800 border-red-300 hover:bg-red-100"
                        }`}
                      >
                        {isAvail ? "In Stock" : "Sold Out"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
