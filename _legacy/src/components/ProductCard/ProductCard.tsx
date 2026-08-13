import { Link } from 'react-router-dom'
import type { Product } from '../../types'
import { CategoryGlyph } from '../Icons'
import './ProductCard.css'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-card__top">
        <span className="product-card__glyph" aria-hidden="true">
          <CategoryGlyph category={product.category || product.physicalState} />
        </span>
        <span className={`product-card__stock ${product.inStock ? 'is-in' : 'is-out'}`}>
          {product.inStock ? 'In stock' : 'Made to order'}
        </span>
      </div>

      <h3 className="product-card__name">
        <Link to={`/catalog/${product.slug}`}>{product.name}</Link>
      </h3>
      <p className="product-card__cas">CAS {product.casNumber}</p>
      <p className="product-card__meta">
        <span className="spec-pill">{product.purity}</span>
        <span className="spec-pill">{product.physicalState}</span>
      </p>
      <p className="product-card__pack">Packaging: {product.packaging}</p>

      <div className="product-card__actions">
        <Link to={`/catalog/${product.slug}`} className="btn btn-secondary product-card__btn">
          View specs
        </Link>
        <a className="btn btn-ghost product-card__btn" href={product.sdsUrl}>
          SDS / TDS
        </a>
        <Link
          to={`/contact?product=${encodeURIComponent(product.slug)}`}
          className="btn btn-primary product-card__btn"
        >
          Request quote
        </Link>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card product-card--skeleton" aria-hidden="true">
      <span className="skel" style={{ width: 48, height: 48, borderRadius: 8 }} />
      <span className="skel" style={{ height: 20, width: '90%' }} />
      <span className="skel" style={{ height: 14, width: '40%' }} />
      <span className="skel" style={{ height: 24, width: '70%' }} />
      <span className="skel" style={{ height: 40, width: '100%', marginTop: 12 }} />
    </div>
  )
}
