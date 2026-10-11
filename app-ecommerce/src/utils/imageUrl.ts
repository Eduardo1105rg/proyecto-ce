const IMAGE_BASE_URL = 'https://eduardo1105rg.github.io/proyecto-ce/images/'

/**
 * Construye la URL completa de la imagen de un producto a partir de su ruta relativa.
 */
export function buildImageUrl(imagePath: string): string {
  return `${IMAGE_BASE_URL}${imagePath}`
}
