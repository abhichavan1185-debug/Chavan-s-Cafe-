import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Order,
  DeliveryPartner,
  RestaurantTable,
  InventoryItem,
  CustomerProfile,
  OrderStatus,
  DeliveryStage,
  OrderPlatform
} from "../types";
import {
  INITIAL_ORDERS,
  INITIAL_PARTNERS,
  INITIAL_TABLES,
  INITIAL_INVENTORY,
  INITIAL_CUSTOMERS
} from "../data/initialData";
import { MENU_ITEMS } from "../data/menuData";
import { playChime } from "../utils/audio";

export const DELIVERY_STAGES: DeliveryStage[] = [
  "Order Placed",
  "Restaurant Accepted",
  "Food Preparing",
  "Food Ready",
  "Delivery Partner Assigned",
  "Delivery Partner Arrived",
  "Order Picked Up",
  "On The Way",
  "Near Customer",
  "Delivered"
];

interface RestaurantContextType {
  orders: Order[];
  partners: DeliveryPartner[];
  tables: RestaurantTable[];
  inventory: InventoryItem[];
  customers: CustomerProfile[];
  activeView: string;
  setActiveView: (view: string) => void;
  activeTrackOrderId: string | null;
  setActiveTrackOrderId: (id: string | null) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  selectedBillOrder: Order | null;
  openBillModal: (order: Order) => void;
  closeBillModal: () => void;
  notificationToast: string | null;
  showToast: (msg: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  // Order lifecycle
  createOrder: (newOrder: Partial<Order>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, stage?: DeliveryStage) => void;
  advanceDeliveryStage: (orderId: string) => void;
  assignPartner: (orderId: string, partnerId: string) => void;
  simulateIncomingOrder: (platform?: OrderPlatform) => void;

  // Table actions
  toggleTableStatus: (tableNum: number) => void;
  vacateAllTables: () => void;
  settleTable: (tableNum: number) => void;

  // Fleet
  addDeliveryPartner: (partner: {
    name: string;
    phone: string;
    avatar: string;
    vehicleType: "Motorbike" | "Electric Scooter" | "Bicycle";
    vehicleNumber: string;
  }) => void;
  updatePartnerStatus: (partnerId: string, status: DeliveryPartner["status"]) => void;

  // Inventory
  restockItem: (itemId: string, qty: number) => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("chavans_orders_v2");
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [partners, setPartners] = useState<DeliveryPartner[]>(() => {
    const saved = localStorage.getItem("chavans_partners_v2");
    return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
  });

  const [tables, setTables] = useState<RestaurantTable[]>(() => {
    const saved = localStorage.getItem("chavans_tables_v2");
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem("chavans_inventory_v2");
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [customers, setCustomers] = useState<CustomerProfile[]>(() => {
    const saved = localStorage.getItem("chavans_customers_v2");
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [activeView, setActiveView] = useState<string>("pos");
  const [activeTrackOrderId, setActiveTrackOrderId] = useState<string | null>("SW-8421");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedBillOrder, setSelectedBillOrder] = useState<Order | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("chavans_orders_v2", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("chavans_partners_v2", JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem("chavans_tables_v2", JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem("chavans_inventory_v2", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("chavans_customers_v2", JSON.stringify(customers));
  }, [customers]);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => {
      setNotificationToast((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const openBillModal = (order: Order) => setSelectedBillOrder(order);
  const closeBillModal = () => setSelectedBillOrder(null);

  // Create new order
  const createOrder = (orderData: Partial<Order>): Order => {
    const idPrefix =
      orderData.platform === "Swiggy"
        ? "SW"
        : orderData.platform === "Zomato"
        ? "ZM"
        : orderData.platform === "Customer-Online"
        ? "ONL"
        : "POS";

    const newId = `${idPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullOrder: Order = {
      id: newId,
      platform: orderData.platform || "POS",
      orderType: orderData.orderType || "Dine-In",
      tableNumber: orderData.tableNumber,
      customerName: orderData.customerName || "Walk-In Guest",
      customerPhone: orderData.customerPhone || "+91 98000 00000",
      deliveryAddress: orderData.deliveryAddress,
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      tax: orderData.tax || 0,
      deliveryFee: orderData.deliveryFee || 0,
      discount: orderData.discount || 0,
      couponCode: orderData.couponCode,
      grandTotal: orderData.grandTotal || 0,
      status: orderData.status || "Accepted",
      deliveryStage: orderData.deliveryStage || "Restaurant Accepted",
      createdAt: "Just now",
      estimatedDeliveryTime: orderData.orderType === "Home Delivery" ? "25 mins" : "15 mins",
      paymentMethod: orderData.paymentMethod || "Cash",
      paymentStatus: orderData.paymentStatus || "Paid",
      riderProgress: 0.05
    };

    setOrders((prev) => [fullOrder, ...prev]);

    // If dine-in, mark table occupied
    if (fullOrder.orderType === "Dine-In" && fullOrder.tableNumber) {
      setTables((prev) =>
        prev.map((t) =>
          t.number === fullOrder.tableNumber
            ? {
                ...t,
                status: "occupied",
                currentOrderId: fullOrder.id,
                currentBill: fullOrder.grandTotal,
                dinerCount: Math.max(1, fullOrder.items.length)
              }
            : t
        )
      );
    }

    // Update customer CRM records permanently
    if (fullOrder.customerPhone && fullOrder.customerPhone !== "+91 98000 00000") {
      setCustomers((prev) => {
        const cleanPhone = fullOrder.customerPhone.replace(/[\s-]/g, "");
        const existingIdx = prev.findIndex((c) => c.phone.replace(/[\s-]/g, "") === cleanPhone);
        const nowStr = "Today, " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

        if (existingIdx >= 0) {
          const old = prev[existingIdx];
          const newSpent = +(old.totalSpent + fullOrder.grandTotal).toFixed(2);
          const newOrders = old.totalOrders + 1;
          const tier = newSpent >= 12000 ? "Platinum Elite" : newSpent >= 7000 ? "Gold VIP" : newSpent >= 3000 ? "Silver" : "Regular";
          const updated = [...prev];
          updated[existingIdx] = {
            ...old,
            name: fullOrder.customerName || old.name,
            totalOrders: newOrders,
            totalSpent: newSpent,
            tier,
            lastOrderedAt: nowStr
          };
          return updated;
        } else if (fullOrder.customerName && fullOrder.customerName !== "Walk-In Guest") {
          const newCust: CustomerProfile = {
            id: `CUST-${prev.length + 1}`,
            name: fullOrder.customerName,
            phone: fullOrder.customerPhone,
            address: fullOrder.deliveryAddress,
            totalOrders: 1,
            totalSpent: fullOrder.grandTotal,
            tier: fullOrder.grandTotal >= 3000 ? "Silver" : "Regular",
            lastOrderedAt: nowStr
          };
          return [newCust, ...prev];
        }
        return prev;
      });
    }

    // Auto-sync to Supabase Cloud if credentials exist in localStorage
    const sbUrl = localStorage.getItem("chavans_supabase_url");
    const sbKey = localStorage.getItem("chavans_supabase_key");
    if (sbUrl && sbKey) {
      try {
        fetch(`${sbUrl}/rest/v1/orders`, {
          method: "POST",
          headers: {
            apikey: sbKey,
            Authorization: `Bearer ${sbKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal"
          },
          body: JSON.stringify({
            id: fullOrder.id,
            platform: fullOrder.platform,
            order_type: fullOrder.orderType,
            table_number: fullOrder.tableNumber || null,
            customer_name: fullOrder.customerName,
            customer_phone: fullOrder.customerPhone,
            delivery_address: fullOrder.deliveryAddress || null,
            grand_total: fullOrder.grandTotal,
            status: fullOrder.status,
            delivery_stage: fullOrder.deliveryStage,
            payment_method: fullOrder.paymentMethod,
            payment_status: fullOrder.paymentStatus
          })
        }).catch(() => {});
      } catch (e) {}
    }

    if (soundEnabled) playChime("new-order");
    showToast(`Order #${fullOrder.id} generated (${fullOrder.platform})`);
    return fullOrder;
  };

  // Update order status
  const updateOrderStatus = (orderId: string, status: OrderStatus, stage?: DeliveryStage) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        let newStage = stage || o.deliveryStage;
        if (!stage) {
          if (status === "Cooking") newStage = "Food Preparing";
          else if (status === "Ready") newStage = "Food Ready";
          else if (status === "Out for Delivery") newStage = "On The Way";
          else if (status === "Delivered") newStage = "Delivered";
        }
        return {
          ...o,
          status,
          deliveryStage: newStage,
          riderProgress: status === "Delivered" ? 1.0 : o.riderProgress
        };
      })
    );
    if (soundEnabled) {
      if (status === "Ready") playChime("ready");
      else playChime("success");
    }
  };

  // Move through the 10 stages
  const advanceDeliveryStage = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const currentIdx = DELIVERY_STAGES.indexOf(o.deliveryStage);
        if (currentIdx < DELIVERY_STAGES.length - 1) {
          const nextStage = DELIVERY_STAGES[currentIdx + 1];
          let nextStatus: OrderStatus = o.status;
          if (nextStage === "Food Preparing") nextStatus = "Cooking";
          if (nextStage === "Food Ready" || nextStage === "Delivery Partner Assigned" || nextStage === "Delivery Partner Arrived") nextStatus = "Ready";
          if (nextStage === "Order Picked Up" || nextStage === "On The Way" || nextStage === "Near Customer") nextStatus = "Out for Delivery";
          if (nextStage === "Delivered") nextStatus = "Delivered";

          const progressMap: Record<DeliveryStage, number> = {
            "Order Placed": 0.0,
            "Restaurant Accepted": 0.1,
            "Food Preparing": 0.25,
            "Food Ready": 0.35,
            "Delivery Partner Assigned": 0.45,
            "Delivery Partner Arrived": 0.55,
            "Order Picked Up": 0.65,
            "On The Way": 0.8,
            "Near Customer": 0.95,
            "Delivered": 1.0
          };

          return {
            ...o,
            deliveryStage: nextStage,
            status: nextStatus,
            riderProgress: progressMap[nextStage] || 0.5
          };
        }
        return o;
      })
    );
    if (soundEnabled) playChime("success");
  };

  // Assign delivery partner
  const assignPartner = (orderId: string, partnerId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              deliveryPartnerId: partnerId,
              deliveryStage: "Delivery Partner Assigned"
            }
          : o
      )
    );

    setPartners((prev) =>
      prev.map((p) =>
        p.id === partnerId
          ? {
              ...p,
              status: "Assigned",
              assignedOrderId: orderId
            }
          : p
      )
    );
    if (soundEnabled) playChime("success");
    showToast(`Partner assigned to #${orderId}`);
  };

  // Simulate an incoming order from Swiggy, Zomato or Online
  const simulateIncomingOrder = (forcedPlatform?: OrderPlatform) => {
    const platforms: OrderPlatform[] = ["Swiggy", "Zomato", "Customer-Online"];
    const platform = forcedPlatform || platforms[Math.floor(Math.random() * platforms.length)];
    const randomDish1 = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];
    const randomDish2 = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];

    const customersNames = [
      { name: "Rohit Sardesai", phone: "+91 98223 99120", addr: "Bhandarkar Road, Pune" },
      { name: "Sneha Deshpande", phone: "+91 97654 31209", addr: "Baner Road, Pune" },
      { name: "Tanmay Joshi", phone: "+91 98810 56743", addr: "Senapati Bapat Road, Pune" },
      { name: "Priyanka Shinde", phone: "+91 99231 87654", addr: "Kalyani Nagar, Pune" }
    ];
    const customer = customersNames[Math.floor(Math.random() * customersNames.length)];

    const qty1 = 1;
    const qty2 = Math.random() > 0.5 ? 1 : 2;
    const subtotal = randomDish1.price * qty1 + randomDish2.price * qty2;
    const tax = +(subtotal * 0.05).toFixed(2);
    const deliveryFee = 30;

    createOrder({
      platform,
      orderType: "Home Delivery",
      customerName: customer.name,
      customerPhone: customer.phone,
      deliveryAddress: customer.addr,
      items: [
        { id: randomDish1.id, name: randomDish1.name, price: randomDish1.price, quantity: qty1, isVeg: randomDish1.isVeg },
        { id: randomDish2.id, name: randomDish2.name, price: randomDish2.price, quantity: qty2, isVeg: randomDish2.isVeg }
      ],
      subtotal,
      tax,
      deliveryFee,
      discount: 0,
      grandTotal: subtotal + tax + deliveryFee,
      status: "Incoming",
      deliveryStage: "Order Placed",
      paymentMethod: "Prepaid",
      paymentStatus: "Paid"
    });
  };

  // Table actions
  const toggleTableStatus = (tableNum: number) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.number !== tableNum) return t;
        const nextStatus = t.status === "available" ? "occupied" : "available";
        return {
          ...t,
          status: nextStatus,
          currentBill: nextStatus === "available" ? 0 : 350,
          dinerCount: nextStatus === "available" ? 0 : 2
        };
      })
    );
  };

  const vacateAllTables = () => {
    setTables((prev) =>
      prev.map((t) => ({
        ...t,
        status: "available",
        currentOrderId: undefined,
        currentBill: 0,
        dinerCount: 0
      }))
    );
    showToast("All 15 tables marked Available");
  };

  const settleTable = (tableNum: number) => {
    const table = tables.find((t) => t.number === tableNum);
    if (!table || table.status === "available") return;
    const relatedOrder = orders.find((o) => o.tableNumber === tableNum && o.status !== "Delivered");
    if (relatedOrder) {
      openBillModal(relatedOrder);
      updateOrderStatus(relatedOrder.id, "Delivered");
    }
    setTables((prev) =>
      prev.map((t) =>
        t.number === tableNum
          ? {
              ...t,
              status: "available",
              currentOrderId: undefined,
              currentBill: 0,
              dinerCount: 0
            }
          : t
      )
    );
    showToast(`Table ${tableNum} settled and cleared`);
  };

  // Fleet management
  const addDeliveryPartner = (data: {
    name: string;
    phone: string;
    avatar: string;
    vehicleType: "Motorbike" | "Electric Scooter" | "Bicycle";
    vehicleNumber: string;
  }) => {
    const newPartner: DeliveryPartner = {
      id: `DP-${100 + partners.length + 1}`,
      ...data,
      status: "Available",
      completedDeliveries: 0,
      rating: 5.0
    };
    setPartners((prev) => [...prev, newPartner]);
    showToast(`Delivery partner ${data.name} enrolled`);
  };

  const updatePartnerStatus = (partnerId: string, status: DeliveryPartner["status"]) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === partnerId ? { ...p, status } : p))
    );
    showToast("Partner status updated");
  };

  // Restock inventory
  const restockItem = (itemId: string, qty: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              currentStock: item.currentStock + qty,
              status: "Optimal"
            }
          : item
      )
    );
    showToast("Stock inventory replenished");
  };

  return (
    <RestaurantContext.Provider
      value={{
        orders,
        partners,
        tables,
        inventory,
        customers,
        activeView,
        setActiveView,
        activeTrackOrderId,
        setActiveTrackOrderId,
        soundEnabled,
        setSoundEnabled,
        selectedBillOrder,
        openBillModal,
        closeBillModal,
        notificationToast,
        showToast,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        createOrder,
        updateOrderStatus,
        advanceDeliveryStage,
        assignPartner,
        simulateIncomingOrder,
        toggleTableStatus,
        vacateAllTables,
        settleTable,
        addDeliveryPartner,
        updatePartnerStatus,
        restockItem
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error("useRestaurant must be used within RestaurantProvider");
  return context;
};
