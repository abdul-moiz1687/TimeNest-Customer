import Seo from '../components/Seo'

const faqs = [
  { q: 'How can I pay?', a: 'Right now we accept Cash on Delivery only. You pay when your order arrives.' },
  { q: 'Do I need an account to order?', a: 'Yes. An account lets you place an order, follow its status in My Orders and write reviews.' },
  { q: 'How do I track my order?', a: 'Login and open My Orders to see the current status of each order.' },
  { q: 'Who can write a review?', a: 'Any logged-in customer can review a product. Ratings shown on the site are calculated only from submitted reviews.' },
  { q: 'What about delivery times and returns?', a: 'We have not published delivery timelines or return terms on the site yet. Please contact us before ordering if you need these details.' },
  { q: 'How do I choose the right clock size?', a: 'Our Journal has a short guide on sizing a clock for your wall.' },
]

export default function FAQ() {
  return (
    <main className="container page narrow">
      <Seo
        title="FAQ"
        description="Answers to common questions about ordering, payment and reviews at TimeNest."
        path="/faq"
        jsonLd={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }}
      />
      <h1>Frequently asked questions</h1>
      <div className="faq">
        {faqs.map((f) => (
          <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
        ))}
      </div>
    </main>
  )
}
