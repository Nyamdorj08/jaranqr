export type Category = {
  id: string;
  name: string;
  sort_order: number;
};

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  tags: string[];
  sort_order: number;
};

export type CategoryWithItems = Category & { items: MenuItem[] };

export type OrderStatus = "pending" | "completed" | "cancelled";

export type Order = {
  id: string;
  table_number: string | null;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  quantity: number;
  price_at_order_time: number;
};

export type OrderWithItems = Order & {
  order_items: (OrderItem & { menu_items: Pick<MenuItem, "name"> | null })[];
};

export type CartLine = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
};
