export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function productSlug(product: { id: string; name: string }): string {
  const base = slugify(product.name)
  return base ? `${base}-${product.id.slice(0, 8)}` : product.id
}
