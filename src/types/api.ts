export interface ApiEnvelope<TData = unknown> {
  success?: boolean;
  message?: string;
  data?: TData;
}

export type RawRecord = Record<string, any>;

export type OrderStatusKey = 'pending' | 'picking' | 'packed';

export type OrderStatusLabel = 'Pending' | 'Picking' | 'Packed';

export interface Order {
  id: string;
  orderId: number;
  orderNumber: string;
  orderDateTime: string;
  orderType: string;
  slotTime: string;
  amount: string;
  status: string;
}

export interface OrderItem {
  id: string;
  name: string;
  qty: string;
  price: number;
  image: string;
  category: string;
  checked: boolean;
}

export interface OrderDetails {
  orderId: number;
  orderNumber: string;
  customer: string;
  amount: number;
  payment: string;
  phone: string;
  items: OrderItem[];
}

export interface OrderDetailsParams {
  orderId?: number | string | null;
  orderNumber?: string;
}

export interface UpdateOrderStatusParams {
  orderId: number | string;
  eventKey: string;
}

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface ChangePasswordParams {
  oldpassword: string;
  newpassword: string;
}

export interface StoredUser {
  accessToken?: string;
  refreshToken?: string;
  pickerAgentId?: number | string;
  custId?: number | string;
  storeId?: number | string;
  storeName?: string;
  phone?: number | string;
  phoneNo?: number | string;
  fullName?: string;
  emailId?: string;
  [key: string]: unknown;
}

export interface PickerProfile {
  fullName: string;
  emailId: string;
  phoneNo: string;
  storeName: string;
}
