import { apiRequest } from './api'

export async function getReviews(productId) {
  const data = await apiRequest(`/api/review/product/${productId}`)
  const reviews = Array.isArray(data) ? data : data.reviews || data.data || []
  const total = data.totalReviews ?? data.numReviews ?? data.count ?? reviews.length
  let avg = data.averageRating ?? data.average ?? data.avgRating
  if (avg == null) avg = reviews.length ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : 0
  return { reviews, total, average: Number(avg) || 0 }
}

export function createReview(token, productId, rating, comment) {
  return apiRequest('/api/review', {
    method: 'POST',
    token,
    body: { product: productId, productId, rating, comment },
  })
}
