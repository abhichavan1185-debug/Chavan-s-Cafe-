export type CategoryName =
  | "Tea & Coffee"
  | "Hot Beverages"
  | "Cold Coffee"
  | "Milkshakes"
  | "Fresh Juices"
  | "Mocktails"
  | "Soft Drinks"
  | "Chinese Veg"
  | "Chinese Non-Veg"
  | "Indian Veg"
  | "Indian Non-Veg"
  | "South Indian"
  | "North Indian"
  | "Biryani"
  | "Pizza"
  | "Burger"
  | "Sandwiches"
  | "Pasta"
  | "Momos"
  | "Maggi"
  | "French Fries"
  | "Rolls & Wraps"
  | "Breakfast"
  | "Bakery"
  | "Cakes & Pastries"
  | "Ice Cream"
  | "Desserts"
  | "Combos & Family Meals";

export interface MenuItem {
  id: string;
  name: string;
  category: CategoryName;
  price: number;
  isVeg: boolean;
  desc: string;
  prepTime: string;
  image: string;
  isBestseller?: boolean;
  isAvailable: boolean;
  rating: number;
}

export type OrderPlatform = "POS" | "Customer-Online" | "Swiggy" | "Zomato";
export type OrderType = "Dine-In" | "Takeaway" | "Home Delivery";

export type DeliveryStage =
  | "Order Placed"
  | "Restaurant Accepted"
  | "Food Preparing"
  | "Food Ready"
  | "Delivery Partner Assigned"
  | "Delivery Partner Arrived"
  | "Order Picked Up"
  | "On The Way"
  | "Near Customer"
  | "Delivered";

export type OrderStatus =
  | "Incoming"
  | "Accepted"
  | "Cooking"
  | "Ready"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  vehicleType: "Motorbike" | "Electric Scooter" | "Bicycle";
  vehicleNumber: string;
  status: "Available" | "Assigned" | "Picking Up" | "Delivering" | "Offline";
  assignedOrderId?: string;
  completedDeliveries: number;
  rating: number;
}

export interface Order {
  id: string;
  platform: OrderPlatform;
  orderType: OrderType;
  tableNumber?: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  grandTotal: number;
  status: OrderStatus;
  deliveryStage: DeliveryStage;
  deliveryPartnerId?: string;
  createdAt: string;
  estimatedDeliveryTime?: string;
  paymentMethod: "Cash" | "UPI / QR" | "Credit Card" | "Prepaid";
  paymentStatus: "Paid" | "Pending";
  // Route coordinates for live map simulation (0 to 1 progress)
  riderProgress?: number;
}

export interface RestaurantTable {
  id: number;
  number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "billing";
  currentOrderId?: string;
  currentBill?: number;
  dinerCount?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "Dairy" | "Beverages" | "Pantry" | "Vegetables" | "Poultry" | "Packaging";
  currentStock: number;
  unit: string;
  minThreshold: number;
  status: "Optimal" | "Low Stock" | "Critical";
  costPerUnit: number;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  tier: "Regular" | "Silver" | "Gold VIP" | "Platinum Elite";
  lastOrderedAt: string;
}
