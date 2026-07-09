export interface GalleryImage {
  id: number
  title: string
  description: string | null
  image_url: string
  thumb_url: string | null
  file_path: string | null
  is_active: boolean
  show_in_hero: boolean
  sort_order: number
  created_at: string
  updated_at: string
}
