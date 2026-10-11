import { apiRequest } from './api'

// Never send prices. Only product id and quantity; the server calculates the total.
export async function placeOrder(token, form, cartItems) {
  const data = await apiRequest('/api/order', {
    method: 'POST',
    token,
    body: {
      customerName: form.customerName,
      phone: form.phone,
      email: form.email,
      address: form.address,
      city: form.city,
      paymentMethod: 'COD',
      items: cartItems.map((i) => ({ product: i.id, quantity: i.quantity })),
    },
  })
  return data.order || data
}

export async function getMyOrders(token) {
  const data = await apiRequest('/api/order/my-orders', { token })
  return Array.isArray(data) ? data : data.orders || data.data || []
}
