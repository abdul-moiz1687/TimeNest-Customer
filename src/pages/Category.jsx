import { useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import ProductListing from '../components/products/ProductListing'
import { CATEGORIES } from '../services/productApi'
import NotFound from './NotFound'

export default function Category() {
  const { slug } = useParams()
  const cat = CATEGORIES.find((c) => c.slug === slug)
  if (!cat) return <NotFound />
  return (
    <main className="container page">
      <Seo
        title={cat.name}
        description={`Shop ${cat.name} from TimeNest. ${cat.blurb}`}
        path={`/category/${cat.slug}`}
        jsonLd={{
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
            { '@type': 'ListItem', position: 2, name: cat.name },
          ],
        }}
      />
      <h1>{cat.name}</h1>
      <p className="muted lead">{cat.blurb}</p>
      <ProductListing key={cat.slug} fixedCategory={cat.name} />
    </main>
  )
}
