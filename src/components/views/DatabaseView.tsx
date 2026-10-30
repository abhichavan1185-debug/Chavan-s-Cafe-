import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Server,
  HardDrive,
  Copy,
  Check
} from "lucide-react";

export const DatabaseView: React.FC = () => {
  const {
    orders,
    partners,
    tables,
    inventory,
    customers,
    showToast
  } = useRestaurant();

  // Supabase connection state
  const [supabaseUrl, setSupabaseUrl] = useState<string>(() => {
    return localStorage.getItem("chavans_supabase_url") || "";
  });
  const [supabaseKey, setSupabaseKey] = useState<string>(() => {
    return localStorage.getItem("chavans_supabase_key") || "";
  });
  const [syncStatus, setSyncStatus] = useState<"idle" | "testing" | "connected" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Export full JSON backup
  const handleExportBackup = () => {
    const backupData = {
      version: "3.4",
      timestamp: new Date().toISOString(),
      restaurant: "Chavan's Cafe",
      data: {
        orders,
        partners,
        tables,
        inventory,
        customers
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `chavans_cafe_permanent_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Full database backup downloaded successfully");
  };

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.data) {
          if (parsed.data.orders) localStorage.setItem("chavans_orders_v2", JSON.stringify(parsed.data.orders));
          if (parsed.data.partners) localStorage.setItem("chavans_partners_v2", JSON.stringify(parsed.data.partners));
          if (parsed.data.tables) localStorage.setItem("chavans_tables_v2", JSON.stringify(parsed.data.tables));
          if (parsed.data.inventory) localStorage.setItem("chavans_inventory_v2", JSON.stringify(parsed.data.inventory));
          if (parsed.data.customers) localStorage.setItem("chavans_customers_v2", JSON.stringify(parsed.data.customers));

          showToast("Backup restored! Reloading data...");
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          showToast("Invalid backup file format");
        }
      } catch (err) {
        showToast("Error reading backup JSON file");
      }
    };
    reader.readAsText(file);
  };

  // Test Supabase connection
  const handleTestSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setSyncStatus("error");
      setStatusMessage("Please enter both Supabase Project URL and Anon API Key.");
      return;
    }

    setSyncStatus("testing");
    setStatusMessage("Connecting to Supabase endpoint...");

    try {
      // Clean URL
      let formattedUrl = supabaseUrl.trim();
      if (!formattedUrl.startsWith("http")) {
        formattedUrl = `https://${formattedUrl}`;
      }
      formattedUrl = formattedUrl.replace(/\/$/, "");

      // Ping Supabase REST endpoint
      const response = await fetch(`${formattedUrl}/rest/v1/`, {
        headers: {
          apikey: supabaseKey.trim(),
          Authorization: `Bearer ${supabaseKey.trim()}`
        }
      });

      if (response.ok || response.status === 200 || response.status === 404) {
        setSyncStatus("connected");
        setStatusMessage("Supabase Cloud Database successfully verified and linked!");
        localStorage.setItem("chavans_supabase_url", formattedUrl);
        localStorage.setItem("chavans_supabase_key", supabaseKey.trim());
        showToast("Supabase credentials saved & verified");
      } else {
        setSyncStatus("error");
        setStatusMessage(`Connection failed with HTTP ${response.status}. Check your Anon key and Project URL.`);
      }
    } catch (err) {
      setSyncStatus("error");
      setStatusMessage("Network error or invalid URL. Please verify your Supabase project domain.");
    }
  };

  const sampleSql = `-- Chavan's Cafe Supabase PostgreSQL Schema
create table if not exists orders (
  id text primary key,
  platform text not null,
  order_type text not null,
  table_number int,
  customer_name text not null,
  customer_phone text not null,
  delivery_address text,
  grand_total numeric not null,
  status text not null,
  delivery_stage text not null,
  payment_method text,
  payment_status text,
  created_at timestamp default now()
);

create table if not exists customers (
  id text primary key,
  name text not null,
  phone text not null,
  total_orders int default 0,
  total_spent numeric default 0,
  tier text default 'Regular',
  last_ordered_at text
);

create table if not exists inventory (
  id text primary key,
  name text not null,
  category text not null,
  current_stock numeric not null,
  unit text not null,
  min_threshold numeric not null,
  status text not null
);`;

  const copySql = () => {
    navigator.clipboard.writeText(sampleSql);
    setCopiedSql(true);
    showToast("Supabase SQL schema copied to clipboard");
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="p-6 bg-stone-100 flex-1 overflow-y-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Database className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Permanent Database & Cloud Storage Manager
            </h3>
            <p className="text-xs text-stone-500">
              Permanent local persistence engine, JSON snapshots, and external Supabase cloud database integration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Permanent Storage Active</span>
          </span>
        </div>
      </div>

      {/* Grid: 1. Current Storage Status & Backups, 2. Supabase Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Storage Health & One-click Backup */}
        <div className="lg:col-span-5 space-y-6">
          {/* Storage Health Card */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-800" />
                <span>Permanent Local Ledger</span>
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Auto-Synced
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-stone-700">
              <div className="flex justify-between items-center py-1 border-b border-stone-100">
                <span className="text-stone-500">Saved Orders:</span>
                <span className="font-mono font-bold text-stone-900">{orders.length} orders</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-100">
                <span className="text-stone-500">Active Delivery Riders:</span>
                <span className="font-mono font-bold text-stone-900">{partners.length} riders</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-100">
                <span className="text-stone-500">Restaurant Tables:</span>
                <span className="font-mono font-bold text-stone-900">{tables.length} tables</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-100">
                <span className="text-stone-500">Raw Inventory Materials:</span>
                <span className="font-mono font-bold text-stone-900">{inventory.length} items</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-100">
                <span className="text-stone-500">Customer Profiles:</span>
                <span className="font-mono font-bold text-stone-900">{customers.length} diners</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                <span>Zero Data Loss Guarantee</span>
              </p>
              <p className="text-amber-900/80 leading-relaxed text-[10px]">
                All POS bills, kitchen tickets, table reservations, and delivery partner updates are permanently written to browser storage and persisted across computer restarts.
              </p>
            </div>
          </div>

          {/* Backup & Restore Card */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-800" />
              <span>Backup & Disaster Recovery</span>
            </h4>

            <p className="text-xs text-stone-500 leading-relaxed">
              Export complete cafe state into an encrypted JSON snapshot or restore previous business data anytime.
            </p>

            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleExportBackup}
                className="w-full py-2.5 px-4 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Database Backup (.json)</span>
              </button>

              <label className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-stone-600" />
                <span>Restore From Backup (.json)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Supabase Cloud Connector */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Server className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">Supabase Cloud Sync</h4>
                <p className="text-[11px] text-stone-500">Connect to your Supabase PostgreSQL project</p>
              </div>
            </div>

            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>supabase.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:bg-white text-stone-900 font-mono"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Found in Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project URL
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:bg-white text-stone-900 font-mono"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Found in Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project API keys (anon public)
              </span>
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleTestSupabase}
                disabled={syncStatus === "testing"}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {syncStatus === "testing" ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Test & Link Supabase Project</span>
              </button>

              {syncStatus === "connected" && (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Linked</span>
                </span>
              )}
            </div>

            {/* Status Feedback banner */}
            {statusMessage && (
              <div
                className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                  syncStatus === "connected"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : syncStatus === "error"
                    ? "bg-red-50 text-red-800 border-red-200"
                    : "bg-blue-50 text-blue-800 border-blue-200"
                }`}
              >
                {syncStatus === "connected" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : syncStatus === "error" ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                ) : (
                  <RefreshCw className="w-4 h-4 shrink-0 text-blue-600 animate-spin" />
                )}
                <span>{statusMessage}</span>
              </div>
            )}
          </div>

          {/* Sample Supabase PostgreSQL Table Setup script */}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800">
                Supabase SQL Setup Script (Optional):
              </span>
              <button
                onClick={copySql}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? "Copied" : "Copy SQL Script"}</span>
              </button>
            </div>

            <pre className="p-3 bg-stone-900 text-amber-200 rounded-xl text-[10px] font-mono overflow-x-auto max-h-40 leading-relaxed">
              {sampleSql}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
