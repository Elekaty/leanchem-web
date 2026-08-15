import { Link } from '@tanstack/react-router'
import type { Product } from '../../types/catalog'

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null

  return (
    <section className="rounded-lg border border-organza/35 bg-white p-6">
      <h2 className="text-lg font-bold text-lapis">Related / alternative grades</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {products.map((p) => (
          <li key={p.id}>
            <Link
              to="/catalog/$slug"
              params={{ slug: p.slug }}
              className="block h-full rounded-lg border border-organza/30 bg-canvas p-3 no-underline hover:border-adamantine hover:no-underline"
            >
              <p className="text-xs font-semibold text-organza">{p.casNumber}</p>
              <p className="mt-1 text-sm font-bold text-velvet">{p.name}</p>
              <p className="mt-1 text-xs text-velvet/55">{p.purity}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
