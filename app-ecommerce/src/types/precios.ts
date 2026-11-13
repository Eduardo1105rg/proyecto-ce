export type TipoPrecio = 'B2C' | 'B2B'

export type ResultadoPrecio = {
  tipo: TipoPrecio
  precioUnitario: number
  precioB2C: number
  precioB2BReferencia: number | null
  minimoB2B: number
  cumpleMinimoB2B: boolean
  errorCondicion: string | null
}

export type FaltanteB2B = {
  objectID: string
  titulo: string
  cantidad: number
  minimo: number
  faltan: number
}
