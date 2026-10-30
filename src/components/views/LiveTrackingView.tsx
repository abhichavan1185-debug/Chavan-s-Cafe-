import React, { useState, useEffect, useRef } from "react";
import { useRestaurant, DELIVERY_STAGES } from "../../context/RestaurantContext";
import {
  MapPin,
  Bike,
  Navigation,
  Clock,
  Phone,
  Search,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Compass
} from "lucide-react";

export const LiveTrackingView: React.FC = () => {
  const {
    orders,
    partners,
    activeTrackOrderId,
    setActiveTrackOrderId,
    advanceDeliveryStage,
    updateOrderStatus
  } = useRestaurant();

  const [searchIdInput, setSearchIdInput] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Find active order or default to first delivery order
  const activeOrder =
    orders.find((o) => o.id === activeTrackOrderId) ||
    orders.find((o) => o.orderType === "Home Delivery" && o.status !== "Delivered") ||
    orders[0];

  const assignedPartner = partners.find((p) => p.id === activeOrder?.deliveryPartnerId);

  // Live Canvas GPS Path Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeOrder) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame = 0;
    let t = activeOrder.riderProgress || 0.1;

    const render = () => {
      const containerWidth = canvas.parentElement?.clientWidth || 360;
      if (Math.abs(canvas.width - containerWidth) > 4) {
        canvas.width = containerWidth;
      }
      const width = canvas.width;
      const height = canvas.height;

      // Clear & Background Map Grid
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(0, 0, width, height);

      // Draw subtle city road network
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1.5;

      // Grid roads
      for (let x = 40; x < width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 40; y < height; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Landmarks
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px sans-serif";
      ctx.fillText("FC Road Junction", 45, 30);
      ctx.fillText("Ferguson College", 50, 190);
      ctx.fillText("Mutha River Bank", width / 2 - 40, height - 20);
      ctx.fillText("Koregaon Park Road", width - 150, 40);
      ctx.fillText("Viman Nagar Hub", width - 130, height - 50);

      // Waypoints for Route from Restaurant to Customer
      const startX = 80;
      const startY = height - 90;
      const endX = width - 90;
      const endY = 80;

      // Curved or waypoint polyline
      const p1 = { x: startX, y: startY };
      const p2 = { x: startX + 100, y: startY - 20 };
      const p3 = { x: startX + 180, y: startY - 110 };
      const p4 = { x: endX - 80, y: endY + 80 };
      const p5 = { x: endX, y: endY };

      // Draw Delivery Route glow & line
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.bezierCurveTo(p2.x, p2.y, p3.x, p3.y, (p3.x + p4.x) / 2, (p3.y + p4.y) / 2);
      ctx.bezierCurveTo(p4.x, p4.y, p4.x + 40, p4.y - 40, p5.x, p5.y);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.stroke();

      // Route dashed overlay
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);

      // 1. Restaurant Hub Marker
      ctx.shadowColor = "rgba(0,0,0,0.2)";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "#451a03";
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("CAFE", p1.x, p1.y + 4);
      ctx.fillStyle = "#1e293b";
      ctx.fillText("Chavan's Cafe (Origin)", p1.x, p1.y + 28);

      // 2. Customer Destination Marker
      ctx.shadowColor = "rgba(0,0,0,0.2)";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.arc(p5.x, p5.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#ffffff";
      ctx.fillText("DEST", p5.x, p5.y + 4);
      ctx.fillStyle = "#1e293b";
      ctx.fillText("Customer Location", p5.x, p5.y - 24);

      // 3. Calculate rider position along path based on t progress
      // Bezier point approximation
      const riderX = p1.x + (p5.x - p1.x) * t;
      const riderY = p1.y + (p5.y - p1.y) * t + Math.sin(t * Math.PI) * -50;

      // Pulse ring around rider
      const pulseSize = 20 + Math.sin(Date.now() / 200) * 4;
      ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
      ctx.beginPath();
      ctx.arc(riderX, riderY, pulseSize, 0, Math.PI * 2);
      ctx.fill();

      // Rider Icon Circle
      ctx.fillStyle = "#059669";
      ctx.beginPath();
      ctx.arc(riderX, riderY, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText("GPS", riderX, riderY + 3);

      // Rider label box
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(riderX - 45, riderY + 18, 90, 18);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText(assignedPartner ? assignedPartner.name.split(" ")[0] : "Rider", riderX, riderY + 30);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [activeOrder, assignedPartner]);

  // Stage progress index (0 to 9)
  const currentStageIndex = activeOrder ? DELIVERY_STAGES.indexOf(activeOrder.deliveryStage) : 0;

  return (
    <div className="p-6 bg-stone-100 flex-1 overflow-y-auto space-y-6">
      {/* Search Header Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              Live Delivery Radar & GPS Tracker
            </h3>
            <p className="text-xs text-stone-500">
              Simulated real-time GPS telemetry • Ready for Google Maps / Mapbox backend
            </p>
          </div>
        </div>

        {/* Search by Order ID */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchIdInput}
              onChange={(e) => setSearchIdInput(e.target.value)}
              placeholder="Search Order ID (e.g. SW-8421)..."
              className="pl-9 pr-3 py-1.5 text-xs bg-stone-100 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700 uppercase"
            />
          </div>
          <button
            onClick={() => {
              const found = orders.find(
                (o) => o.id.toUpperCase() === searchIdInput.trim().toUpperCase()
              );
              if (found) setActiveTrackOrderId(found.id);
            }}
            className="px-3 py-1.5 bg-amber-800 text-white rounded-lg text-xs font-bold hover:bg-amber-900"
          >
            Track
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map & Details Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Map View Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col">
          {/* Map Top Bar */}
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-stone-900 font-mono">
                TRACKING: #{activeOrder?.id || "N/A"}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                {activeOrder?.platform}
              </span>
            </div>

            <div className="text-xs font-semibold text-stone-600 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Est. Delivery: {activeOrder?.estimatedDeliveryTime || "15 mins"}</span>
            </div>
          </div>

          {/* Interactive Simulated Map Canvas */}
          <div className="relative w-full h-[400px] bg-slate-200">
            <canvas
              ref={canvasRef}
              width={700}
              height={400}
              className="w-full h-full block"
            />

            {/* Float ETA card */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-stone-200 shadow-md max-w-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulated Rider En Route</span>
              </div>
              <p className="text-[10px] text-stone-500">
                Destination: {activeOrder?.deliveryAddress || "Pune Central Diner"}
              </p>
              <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${(activeOrder?.riderProgress || 0.1) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Map Footer Controls */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] text-stone-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Contactless Delivery Safe & Sanitized</span>
            </div>

            {activeOrder && activeOrder.status !== "Delivered" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => advanceDeliveryStage(activeOrder.id)}
                  className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <span>Advance to Next Stage</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => updateOrderStatus(activeOrder.id, "Delivered", "Delivered")}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Mark Delivered
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 10-Step Timeline & Details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Order Quick Selector */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-stone-700">Select Active Order to Track:</span>
            <div className="flex flex-wrap gap-1.5">
              {orders
                .filter((o) => o.status !== "Delivered" && o.status !== "Cancelled")
                .map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setActiveTrackOrderId(o.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                      activeOrder?.id === o.id
                        ? "bg-amber-800 text-white shadow-xs"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    #{o.id} ({o.platform})
                  </button>
                ))}
            </div>
          </div>

          {/* Delivery Partner Details Card */}
          {assignedPartner ? (
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={assignedPartner.avatar}
                  alt={assignedPartner.name}
                  className="w-12 h-12 rounded-xl object-cover border border-stone-200 shadow-xs"
                />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">{assignedPartner.name}</h4>
                  <p className="text-[11px] text-stone-500">
                    {assignedPartner.vehicleType} • {assignedPartner.vehicleNumber}
                  </p>
                  <p className="text-[10px] text-amber-700 font-bold">
                    ★ {assignedPartner.rating} ({assignedPartner.completedDeliveries} deliveries)
                  </p>
                </div>
              </div>

              <a
                href={`tel:${assignedPartner.phone}`}
                className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                title="Call Delivery Partner"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs text-center text-xs text-stone-500 py-6">
              <Bike className="w-8 h-8 mx-auto text-stone-300 mb-1" />
              <span>No delivery partner assigned yet</span>
            </div>
          )}

          {/* 10-Step Interactive Delivery Timeline */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                10-Stage Delivery Lifecycle
              </h4>
              <span className="text-[10px] font-bold text-amber-800">
                Stage {currentStageIndex + 1} of 10
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {DELIVERY_STAGES.map((stage, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div key={stage} className="flex items-center gap-3">
                    {/* Circle Node */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isPassed
                          ? "bg-emerald-600 text-white"
                          : isCurrent
                          ? "bg-amber-600 text-white ring-4 ring-amber-100 animate-pulse"
                          : "bg-stone-200 text-stone-500"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>

                    {/* Label */}
                    <div className="flex-1">
                      <p
                        className={`text-xs ${
                          isCurrent
                            ? "font-extrabold text-stone-900"
                            : isPassed
                            ? "font-medium text-stone-700"
                            : "text-stone-400"
                        }`}
                      >
                        {stage}
                      </p>
                    </div>

                    {isCurrent && (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        In Progress
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
