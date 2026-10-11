import Seo from '../components/Seo'
import ProductListing from '../components/products/ProductListing'

export default function Shop() {
  return (
    <main className="container page">
      <Seo title="Shop Wall Clocks" description="Browse TimeNest premium wall clocks. Filter by style and price, and pay with Cash on Delivery." path="/shop" />
      <h1>Shop</h1>
      <ProductListing />
    </main>
  )
}
