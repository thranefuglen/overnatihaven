// Relative URL by default: Vite proxy handles /api/* locally, Vercel serves from same domain in production
export const API_BASE_URL = import.meta.env.VITE_API_URL || ''
export const API_URL = `${API_BASE_URL}/api`
