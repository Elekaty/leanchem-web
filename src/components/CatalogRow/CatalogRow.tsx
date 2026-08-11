import type { Product } from '../../types';
import { TruncatedText } from '../TruncatedText/TruncatedText';
import './CatalogRow.css';

interface CatalogRowProps {
  productData: Product;
  isTierVerified: boolean;
  onRowClick: (product: Product) => void;
  isExpanded?: boolean;
  drawerId?: string;
  rowRef?: (el: HTMLButtonElement | null) => void;
}

export function CatalogRow({
  productData,
  isTierVerified,
  onRowClick,
  isExpanded = false,
  drawerId = 'quick-view-drawer',
  rowRef,
}: CatalogRowProps) {
  return (
    <button
      type="button"
      className="catalog-row"
      ref={rowRef}
      onClick={() => onRowClick(productData)}
      aria-expanded={isExpanded}
      aria-controls={drawerId}
    >
      <span className="catalog-row__cas">{productData.casNumber}</span>
      <span className="catalog-row__main">
        <TruncatedText text={productData.name} className="catalog-row__name" />
        <span className="catalog-row__meta">
          <span>Purity {productData.purity}</span>
          <span aria-hidden="true">·</span>
          <span>MOQ {productData.moq}</span>
          {isTierVerified ? null : (
            <>
              <span aria-hidden="true">·</span>
              <span className="catalog-row__locked">Pricing locked</span>
            </>
          )}
        </span>
      </span>
      <span className="catalog-row__purity">{productData.purity}</span>
      <span className="catalog-row__moq">{productData.moq}</span>
      <span className="catalog-row__lead">{productData.leadTime}</span>
    </button>
  );
}

export function CatalogRowSkeleton() {
  return (
    <div className="catalog-row catalog-row--skeleton" aria-hidden="true">
      <span className="skel skel-cas" />
      <span className="skel skel-name" />
      <span className="skel skel-sm" />
      <span className="skel skel-sm" />
      <span className="skel skel-md" />
    </div>
  );
}
