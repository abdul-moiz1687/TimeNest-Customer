import { Navigate, useSearchParams } from 'react-router-dom'

export default function Search() {
  const [sp] = useSearchParams()
  return <Navigate to={`/shop?search=${encodeURIComponent(sp.get('q') || '')}`} replace />
}
