import httpClient from './httpClient';

const STATUS_LABELS = {
  pending: 'Pending',
  picking: 'Picking',
  packed: 'Packed',
};

const normalizeOrder = (order, index, fallbackStatus) => ({
  id: String(order.id ?? index + 1),
  orderId: Number(order.orderId ?? order.id ?? 0),
  orderNumber:
    order.orderNumber ??
    order.order_number ??
    (order.orderId ? `#ORD${order.orderId}` : '#ORD-NA'),
  orderDateTime: order.orderDateTime ?? order.order_date_time ?? order.orderDate ?? '',
  orderType:
    order.orderType ??
    order.order_type ??
    order.deliveryMode ??
    (order.deliverySlotTime ? 'slot' : 'express'),
  slotTime: order.slotTime ?? order.slot_time ?? order.deliverySlotTime ?? '',
  amount: String(order.amount ?? order.grandTotal ?? '0.00'),
  status: order.status ?? fallbackStatus,
});

export const getOrders = async (status = 'pending') => {
  const normalizedStatus = String(status).toLowerCase();
  const response = await httpClient.get('/pickeragent/orders', {
    params: { status: normalizedStatus },
  });

  const payload = Array.isArray(response.data)
    ? response.data
    : response.data?.data?.items ?? response.data?.data ?? [];

  const fallbackStatus = STATUS_LABELS[normalizedStatus] || 'Pending';
  return payload.map((order, index) => normalizeOrder(order, index, fallbackStatus));
};

export const updateOrderStatus = async ({ orderId, eventKey }) => {
  const response = await httpClient.post('/pickeragent/orders/updatestatus', {
    orderId,
    eventKey,
  });

  if (!response?.data?.success) {
    throw new Error(response?.data?.message || 'Unable to update order status.');
  }

  return response.data;
};

const normalizeOrderItem = (item, index) => ({
  id: String(
    item.id ??
    item.itemId ??
    item.orderItemId ??
    item.productId ??
    index + 1
  ),
  name: item.name ?? item.productName ?? item.itemName ?? 'Item',
  qty: String(item.qty ?? item.quantity ?? 1),
  price: Number(item.price ?? item.rate ?? item.unitPrice ?? item.lineTotal ?? 0),
  image:
    item.image ??
    item.imageUrl ??
    item.productImage ??
    'https://via.placeholder.com/100',
  category:
    item.category ??
    item.categoryName ??
    item.section ??
    'Items',
  checked: Boolean(item.checked ?? item.isPicked ?? item.picked),
});

const normalizeOrderDetails = (payload = {}, fallback = {}) => {
  const header = payload.header ?? payload;
  const shippingAddress = payload.shippingAddress ?? {};
  const summary = payload.summary ?? {};

  const categoriesRaw = Array.isArray(payload.categories) ? payload.categories : [];
  const items = categoriesRaw.flatMap((category) => {
    const itemsRaw = Array.isArray(category.items) ? category.items : [];
    return itemsRaw.map((item, index) => normalizeOrderItem(
      {
        ...item,
        category: category.catName ?? category.categoryName ?? 'Items',
      },
      index
    ));
  });

  return {
    orderId: Number(header.orderId ?? fallback.orderId ?? 0),
    orderNumber:
      header.orderNumber ??
      header.order_number ??
      fallback.orderNumber ??
      '#ORD-NA',
    customer:
      shippingAddress.custName ??
      header.customerName ??
      header.custName ??
      '-',
    amount: Number(summary.grandTotal ?? header.grandTotal ?? 0),
    payment:
      header.paymentMethod ??
      header.paymentMode ??
      header.paymentType ??
      '-',
    phone:
      String(shippingAddress.phone ?? header.phoneNo ?? header.phone ?? '-'),
    items,
  };
};

export const getOrderDetails = async ({ orderId, orderNumber }) => {
  if (!orderId) {
    return normalizeOrderDetails({}, { orderId, orderNumber });
  }

  const response = await httpClient.get(`/pickeragent/orders/${orderId}`);

  if (!response?.data?.success) {
    throw new Error(response?.data?.message || 'Unable to fetch order details.');
  }

  const payload = response.data?.data ?? {};
  return normalizeOrderDetails(payload, { orderId, orderNumber });
};
