import React, { useState, useMemo } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { MENU_ITEMS, ALL_CATEGORIES, FALLBACK_FOOD_IMAGE } from "../../data/menuData";
import { CategoryName, MenuItem, OrderType } from "../../types";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  Utensils,
  Clock,
  Sparkles,
  Layers,
  ChefHat,
  ShoppingBag,
  X,
  Receipt
} from "lucide-react";

export const PosView: React.FC = () => {
  const {
    createOrder,
    openBillModal,
    showToast,
    tables
  } = useRestaurant();

  const [selectedCategory, setSelectedCategory] = useState<CategoryName | "All">("All");
  const [dietaryFilter, setDietaryFilter] = useState<"all" | "veg" | "nonveg">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");

  // Cart state
  const [cart, setCart] = useState<{ item: MenuItem; qty: number }[]>([]);
  const [orderType, setOrderType] = useState<OrderType>("Dine-In");
  const [selectedTable, setSelectedTable] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>("Walk-In Guest");
  const [customerPhone, setCustomerPhone] = useState<string>("+91 98220 00000");

  // Mobile cart drawer state
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);

  // Filtered menu
  const filteredDishes = useMemo(() => {
    let result = MENU_ITEMS.filter((item) => {
      const matchCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchDiet =
        dietaryFilter === "all" ||
        (dietaryFilter === "veg" && item.isVeg) ||
        (dietaryFilter === "nonveg" && !item.isVeg);
      const matchSearch =
        searchQuery.trim() === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchDiet && matchSearch;
    });

    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [selectedCategory, dietaryFilter, searchQuery, sortBy]);

  // Cart actions
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) => (c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.item.id === itemId) {
            const newQty = c.qty + delta;
            return newQty > 0 ? { ...c, qty: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as { item: MenuItem; qty: number }[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const subtotal = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);
  const tax = +(subtotal * 0.05).toFixed(2); // 5% GST
  const grandTotal = +(subtotal + tax).toFixed(2);
  const totalCartCount = cart.reduce((s, c) => s + c.qty, 0);

  // KOT action
  const handleSendKOT = () => {
    if (cart.length === 0) {
      showToast("Cart is empty. Add dishes first.");
      return;
    }
    createOrder({
      platform: "POS",
      orderType,
      tableNumber: orderType === "Dine-In" ? selectedTable : undefined,
      customerName,
      customerPhone,
      items: cart.map((c) => ({
        id: c.item.id,
        name: c.item.name,
        price: c.item.price,
        quantity: c.qty,
        isVeg: c.item.isVeg
      })),
      subtotal,
      tax,
      deliveryFee: 0,
      discount: 0,
      grandTotal,
      status: "Cooking",
      deliveryStage: "Food Preparing",
      paymentMethod: "Cash",
      paymentStatus: "Pending"
    });
    showToast(`KOT generated for Kitchen Display`);
    clearCart();
    setIsMobileCartOpen(false);
  };

  // Settle bill action
  const handleSettleBill = () => {
    if (cart.length === 0) {
      showToast("Cart is empty. Add dishes first.");
      return;
    }
    const order = createOrder({
      platform: "POS",
      orderType,
      tableNumber: orderType === "Dine-In" ? selectedTable : undefined,
      customerName,
      customerPhone,
      items: cart.map((c) => ({
        id: c.item.id,
        name: c.item.name,
        price: c.item.price,
        quantity: c.qty,
        isVeg: c.item.isVeg
      })),
      subtotal,
      tax,
      deliveryFee: 0,
      discount: 0,
      grandTotal,
      status: "Delivered",
      deliveryStage: "Delivered",
      paymentMethod: "UPI / QR",
      paymentStatus: "Paid"
    });
    openBillModal(order);
    clearCart();
    setIsMobileCartOpen(false);
  };

  // Shared Cart Content Component
  const CartContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Order Meta Header */}
      <div className="p-4 border-b border-stone-200 bg-stone-50/70 space-y-3">
        {/* Order Type Segmented Control */}
        <div className="grid grid-cols-3 bg-stone-200 p-0.5 rounded-lg text-xs font-bold">
          {(["Dine-In", "Takeaway", "Home Delivery"] as OrderType[]).map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`py-1.5 rounded-md text-center transition-all ${
                orderType === type
                  ? "bg-amber-800 text-white shadow-xs"
                  : "text-stone-700 hover:text-stone-950"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Table Selector (if Dine-In) */}
        {orderType === "Dine-In" && (
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-800 shrink-0" />
            <label className="text-xs font-bold text-stone-700 whitespace-nowrap">Table:</label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(Number(e.target.value))}
              className="flex-1 text-xs font-bold bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900 focus:outline-none"
            >
              {tables.map((t) => (
                <option key={t.number} value={t.number}>
                  Table {t.number} ({t.status.toUpperCase()} • Cap {t.capacity})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Customer Name & Phone */}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Guest Name"
            className="px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
          />
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Phone"
            className="px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
          />
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-stone-400 p-6 text-center">
            <Utensils className="w-12 h-12 text-stone-300 mb-2 stroke-[1.5]" />
            <p className="text-xs font-bold text-stone-600">Cart is empty</p>
            <p className="text-[11px] text-stone-400">Click any menu dish to add to this bill</p>
          </div>
        ) : (
          cart.map(({ item, qty }) => (
            <div
              key={item.id}
              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-2"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      item.isVeg ? "bg-emerald-600" : "bg-red-600"
                    }`}
                  />
                  <h5 className="text-xs font-bold text-stone-900 truncate">{item.name}</h5>
                </div>
                <div className="text-[10px] text-stone-500 font-mono">
                  ₹{item.price} each
                </div>
              </div>

              {/* Qty controls */}
              <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg px-1 py-0.5 shrink-0">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-5 h-5 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-5 text-center text-xs font-mono font-bold text-stone-900">
                  {qty}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="w-5 h-5 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Line total */}
              <span className="text-xs font-mono font-bold text-stone-900 w-12 text-right shrink-0">
                ₹{item.price * qty}
              </span>

              {/* Remove button */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-stone-400 hover:text-red-600 p-1 rounded shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Billing Calculations Footer */}
      <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-2 flex-shrink-0">
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal:</span>
            <span className="font-mono font-semibold">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>GST (5% SGST + CGST):</span>
            <span className="font-mono font-semibold">₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-stone-950 pt-1.5 border-t border-stone-200">
            <span>Grand Total:</span>
            <span className="font-mono text-base text-amber-900">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-12 gap-2 pt-2">
          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="col-span-3 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 disabled:opacity-40 transition-colors"
          >
            Clear
          </button>

          <button
            onClick={handleSendKOT}
            disabled={cart.length === 0}
            className="col-span-4 py-2.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 transition-colors"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>KOT</span>
          </button>

          <button
            onClick={handleSettleBill}
            disabled={cart.length === 0}
            className="col-span-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 text-white text-xs font-bold shadow-md hover:from-amber-800 hover:to-amber-900 flex items-center justify-center gap-1.5 disabled:opacity-40 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Settle Bill</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-stone-100 relative">
      {/* Menu Catalog & Filter Pane */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-stone-200">
        {/* Category Pill Bar (All 28 categories) */}
        <div className="p-3 bg-white border-b border-stone-200 flex flex-col gap-2.5 flex-shrink-0 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === "All"
                  ? "bg-amber-800 text-white shadow-xs"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              All (168)
            </button>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-amber-800 text-white shadow-xs"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search, Dietary Filters, Sort & Mobile Cart Trigger */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[170px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes (e.g. Chai, Biryani, Pizza)..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-100 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 focus:bg-white text-stone-900"
              />
            </div>

            {/* Veg / Non-Veg Switcher */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs font-medium">
              <button
                onClick={() => setDietaryFilter("all")}
                className={`px-2 py-1 rounded-md transition-colors ${
                  dietaryFilter === "all" ? "bg-white font-bold text-stone-900 shadow-xs" : "text-stone-600"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDietaryFilter("veg")}
                className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
                  dietaryFilter === "veg" ? "bg-white font-bold text-emerald-800 shadow-xs" : "text-stone-600"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-xs border border-emerald-600 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                </span>
                <span>Veg</span>
              </button>
              <button
                onClick={() => setDietaryFilter("nonveg")}
                className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
                  dietaryFilter === "nonveg" ? "bg-white font-bold text-red-800 shadow-xs" : "text-stone-600"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-xs border border-red-600 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                </span>
                <span>Non-Veg</span>
              </button>
            </div>

            {/* Mobile View Cart Button */}
            <button
              onClick={() => setIsMobileCartOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-800 text-white text-xs font-bold shadow-xs relative"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Cart</span>
              {totalCartCount > 0 && (
                <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Price Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "default" | "price-asc" | "price-desc")}
              className="hidden md:block text-xs bg-stone-100 border border-stone-200 rounded-lg px-2 py-1.5 text-stone-700 focus:outline-none"
            >
              <option value="default">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Cards Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4 pb-20 lg:pb-4">
          {filteredDishes.length === 0 ? (
            <div className="col-span-full py-16 text-center text-stone-500">
              <Utensils className="w-10 h-10 mx-auto text-stone-300 mb-2" />
              <p className="text-sm font-semibold">No dishes found matching your search</p>
              <p className="text-xs text-stone-400">Try adjusting your filters or search keywords</p>
            </div>
          ) : (
            filteredDishes.map((item) => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col shadow-xs hover:shadow-lg hover:border-amber-500 transition-all cursor-pointer group shrink-0"
                style={{ minHeight: "290px", height: "300px" }}
              >
                {/* Food Image */}
                <div
                  className="w-full relative bg-stone-900 overflow-hidden shrink-0"
                  style={{ height: "125px", minHeight: "125px" }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    style={{ height: "100%", width: "100%", objectFit: "cover" }}
                  />
                  {/* Veg / Non-Veg Indicator */}
                  <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs p-1 rounded-sm shadow-xs">
                    <span
                      className={`w-3.5 h-3.5 rounded-xs border ${
                        item.isVeg ? "border-emerald-600" : "border-red-600"
                      } flex items-center justify-center`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.isVeg ? "bg-emerald-600" : "bg-red-600"
                        }`}
                      />
                    </span>
                  </div>

                  {/* Prep time badge */}
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{item.prepTime}</span>
                  </div>

                  {/* Bestseller ribbon */}
                  {item.isBestseller && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-stone-950 text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>BEST</span>
                    </div>
                  )}
                </div>

                {/* Card Info Body */}
                <div className="p-3 flex-1 flex flex-col justify-between shrink-0 bg-white">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800">
                      {item.category}
                    </span>
                    <h4 className="text-xs font-bold text-stone-900 leading-snug line-clamp-1 group-hover:text-amber-900 mt-0.5">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  {/* Price and Add button */}
                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-sm font-mono font-bold text-amber-950">
                      ₹{item.price}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-900 text-xs font-bold border border-amber-300 transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile Sticky Floating Cart Bar */}
      {cart.length > 0 && !isMobileCartOpen && (
        <div className="lg:hidden fixed bottom-4 inset-x-4 z-40 animate-in slide-in-from-bottom-4 duration-150">
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full bg-gradient-to-r from-amber-900 to-amber-800 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-amber-500/30"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-mono font-bold text-xs">
                {totalCartCount}
              </span>
              <div className="text-left">
                <span className="text-[10px] text-amber-200 block uppercase font-bold">Total Bill:</span>
                <span className="text-sm font-mono font-black text-white">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <span className="px-3 py-1.5 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-xs">
              View Bill / Settle &rarr;
            </span>
          </button>
        </div>
      )}

      {/* Desktop Fixed Cart Sidebar */}
      <div className="hidden lg:flex w-96 bg-white flex-col flex-shrink-0 shadow-lg border-l border-stone-200">
        {CartContent}
      </div>

      {/* Mobile Fullscreen Slide-over Cart Drawer */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm tracking-wide">POS Billing & Settle</h3>
              </div>
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-hidden">
              {CartContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
