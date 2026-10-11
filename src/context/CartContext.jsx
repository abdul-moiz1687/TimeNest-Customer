import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const KEY = 'timenest_cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
  })

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)) }, [items])

  // Cart mein sirf display ke liye price rakhte hain. Asli price backend calculate karta hai.
  const addItem = (p, qty = 1) =>
    setItems((prev) => {
      const found = prev.find((i) => i.id === p.id)
      if (found) return prev.map((i) => (i.id === p.id ? { ...i, quantity: i.quantity + qty } : i))
      return [...prev, { id: p.id, slug: p.slug, name: p.name, price: p.price, image: p.image, quantity: qty }]
    })
  const setQuantity = (id, q) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, Math.min(99, q)) } : i)))
  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id))
  const clearCart = () => setItems([])

  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items])
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items])

  return (
    <CartContext.Provider value={{ items, count, subtotal, addItem, setQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
