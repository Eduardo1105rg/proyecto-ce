export type StockBranch = {
  branch_id: string
  stock: number
}

export type B2BPriceTier = {
  min_qty: number
  unit_price: number
}

export type Product = {
  object_id: string
  objectID: string 
  sku: string
  title: string
  name?: string
  brand: string
  category: string
  price: number
  currency: string
  rating: number
  reviews_count: number
  image: string
  images: string[]
  tiered_b2b_pricing: B2BPriceTier[]
  payment_methods: string[]
  warranty_months: number
  return_days: number
  stock_by_branch: StockBranch[]
  facets: {
    subcategory: string
    color: string | null
    material: string | null
    style: string | null
    eco_friendly: boolean
    free_shipping: boolean
    tax_exempt: boolean
  }
  tags: string[]
}