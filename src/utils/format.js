export const formatPrice = (n) => `Rs. ${Number(n || 0).toLocaleString('en-PK')}`
export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
    export const SITE_URL = 'https://timenest-wall-clock-store.vercel.app'// deployment ke waqt asli domain se badal dena
export const CONTACT_EMAIL = 'abdulmoizarain766@gmail.com' // apni asli email se badal dena

export const getOrderTotal = (o) => o?.totalPrice ?? o?.totalAmount ?? o?.total ?? o?.grandTotal ?? 0
export const getOrderNumber = (o) => o?.orderNumber || o?._id || ''
