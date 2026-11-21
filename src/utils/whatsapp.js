// Set VITE_WHATSAPP_NUMBER (digits with country code, e.g. 923001234567) to enable the WhatsApp order buttons
export const WA_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '')
export const waLink = (text) => (WA_NUMBER ? `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}` : '')
