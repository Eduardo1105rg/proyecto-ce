export type StockBranch = {
  branch_id: string
  stock: number
}

export type Product = {
  object_id: string
  sku: string
  name: string
  brand: string
  category: string
  price: number
  currency: string
  rating: number
  reviews_count: number
  image: string
  images: string[]
  warranty_months: number
  return_days: number
  stock_by_branch: StockBranch[]
  facets: {
    subcategory: string
    color: string | null
    material: string | null
    eco_friendly: boolean
    free_shipping: boolean
    tax_exempt: boolean
  }
  tags: string[]
}