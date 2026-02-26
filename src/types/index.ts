export interface GalleryImage {
  id: number
  title: string
  description: string | null
  image_url: string
  file_path: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}
