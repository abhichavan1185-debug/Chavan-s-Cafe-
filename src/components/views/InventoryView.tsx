import React from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { Boxes, Plus, AlertCircle, CheckCircle2 } from "lucide-react";

export const InventoryView: React.FC = () => {
  const { inventory, restockItem } = useRestaurant();

  return (
    <div className="p-6 bg-stone-100 flex-1 overflow-y-auto space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Boxes className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Kitchen Raw Materials & Inventory Ledger
            </h3>
            <p className="text-xs text-stone-500">
              Real-time stock depletion, minimum reserve thresholds and supplier restocking
            </p>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Material / Ingredient</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Current Stock</th>
                <th className="px-5 py-3">Min Threshold</th>
                <th className="px-5 py-3">Health Status</th>
                <th className="px-5 py-3 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
              {inventory.map((item) => {
                const isLow = item.currentStock <= item.minThreshold;

                return (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-stone-900">{item.name}</div>
                      <div className="text-[10px] text-stone-400 font-mono">ID: {item.id}</div>
                    </td>
                    <td className="px-5 py-3.5 text-stone-600">{item.category}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-stone-900">
                      {item.currentStock} {item.unit}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-stone-500">
                      {item.minThreshold} {item.unit}
                    </td>
                    <td className="px-5 py-3.5">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                          <AlertCircle className="w-3 h-3" />
                          <span>Low Stock</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Optimal</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => restockItem(item.id, 5)}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-900 font-bold text-[11px] rounded-lg border border-stone-200 transition-colors"
                      >
                        +5 {item.unit}
                      </button>
                      <button
                        onClick={() => restockItem(item.id, 20)}
                        className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white font-bold text-[11px] rounded-lg shadow-xs transition-colors"
                      >
                        +20 {item.unit}
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
