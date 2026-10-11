import { apiRequest } from './api'

// Handles both `{ token, user }` and flat response shapes
function normalizeAuth(data) {
  const token = data.token || data.accessToken
  const user = data.user || (({ token: _t, accessToken: _a, message: _m, ...rest }) => rest)(data)
  return { token, user }
}

export async function login(email, password) {
  return normalizeAuth(await apiRequest('/api/user/login', { method: 'POST', body: { email, password } }))
}

export async function signup(name, email, password) {
  const data = await apiRequest('/api/user/signup', { method: 'POST', body: { name, email, password } })
  // If signup does not return a token, log the user in right away
  if (!(data.token || data.accessToken)) return login(email, password)
  return normalizeAuth(data)
}

export async function getProfile(token) {
  const data = await apiRequest('/api/user/profile', { token })
  return data.user || data
}
