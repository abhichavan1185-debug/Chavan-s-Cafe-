import React from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { Contact2, Phone, Mail, Award, Clock } from "lucide-react";

export const CustomerCrmView: React.FC = () => {
  const { customers } = useRestaurant();

  const tierColors: Record<string, string> = {
    Regular: "bg-stone-100 text-stone-700 border-stone-200",
    Silver: "bg-slate-100 text-slate-800 border-slate-300",
    "Gold VIP": "bg-amber-100 text-amber-900 border-amber-300 font-bold",
    "Platinum Elite": "bg-purple-100 text-purple-900 border-purple-300 font-black"
  };

  return (
    <div className="p-6 bg-stone-100 flex-1 overflow-y-auto space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
        <div className="w-13 h-13 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
          <Contact2 className="w-7 h-7 stroke-[2.5]" />
        </div>
        <div>
          <h3 className="text-base font-bold text-stone-900">
            Customer Relationship Management (CRM)
          </h3>
          <p className="text-xs text-stone-500">
            Diner profiles, repeat visit metrics, loyalty tiers and spending history
          </p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Customer Profile</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Delivery Zone</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Total Spend</th>
                <th className="px-5 py-3">Loyalty Tier</th>
                <th className="px-5 py-3">Last Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-stone-900">{c.name}</div>
                    <div className="text-[10px] text-stone-400 font-mono">ID: {c.id}</div>
                  </td>
                  <td className="px-5 py-3.5 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-stone-600 font-mono">
                      <Phone className="w-3 h-3 text-stone-400" />
                      <span>{c.phone}</span>
                    </div>
                    {c.email && (
                      <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                        <Mail className="w-3 h-3 text-stone-400" />
                        <span>{c.email}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-stone-600">{c.address || "Pune Central"}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-stone-900">{c.totalOrders}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-amber-950">
                    ₹{c.totalSpent.toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] border ${
                        tierColors[c.tier] || "bg-stone-100 text-stone-700"
                      }`}
                    >
                      <Award className="w-3 h-3" />
                      <span>{c.tier}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[11px] text-stone-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>{c.lastOrderedAt}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
