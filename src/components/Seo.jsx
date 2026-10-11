import { SITE_URL } from '../utils/format'

// React 19 hoists <title>, <meta> and <link> into <head> automatically
export default function Seo({ title, description, path = '/', image, type = 'website', jsonLd }) {
  const fullTitle = title ? `${title} | TimeNest` : 'TimeNest | Premium Designer Wall Clocks'
  const url = `${SITE_URL}${path}`
  const ld = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:site_name" content="TimeNest" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      {ld.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
    </>
  )
}
