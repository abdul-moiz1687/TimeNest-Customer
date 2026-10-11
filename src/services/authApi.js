import { apiRequest } from './api'

// Backend response alag shape mein ho sakta hai, isliye dono handle kiye hain
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
  // Agar signup token nahi deta to login kara lo
  if (!(data.token || data.accessToken)) return login(email, password)
  return normalizeAuth(data)
}

export async function getProfile(token) {
  const data = await apiRequest('/api/user/profile', { token })
  return data.user || data
}
