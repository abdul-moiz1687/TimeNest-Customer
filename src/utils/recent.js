const KEY = 'timenest_recent'

export function getRecent() {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
}

export function pushRecent(p) {
  try {
    const list = getRecent().filter((x) => x.id !== p.id)
    list.unshift({ id: p.id, slug: p.slug, name: p.name, price: p.price, image: p.image })
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 8)))
  } catch {
    /* storage unavailable: recently viewed is optional */
  }
}
