import { z } from 'zod';

// Validation schemas
export const createInquirySchema = z.object({
  name: z.string().min(2, 'Navn skal være mindst 2 tegn').max(100, 'Navn må max være 100 tegn'),
  email: z.string().email('Ugyldig email adresse'),
  phone: z.string().optional(),
  arrivalDate: z.string().refine((date) => {
    const arrivalDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return arrivalDate >= today;
  }, 'Ankomstdato skal være i dag eller senere'),
  departureDate: z.string(),
  numPeople: z.number().int().min(1, 'Der skal mindst være 1 person').max(10, 'Max 10 personer'),
  message: z.string().max(1000, 'Besked må max være 1000 tegn').optional(),
}).refine((data) => {
  const arrival = new Date(data.arrivalDate);
  const departure = new Date(data.departureDate);
  return departure > arrival;
}, {
  message: 'Afrejsedato skal være efter ankomstdato',
  path: ['departureDate'],
});

export const createContactSchema = z.object({
  name: z.string().min(2, 'Navn skal være mindst 2 tegn').max(100, 'Navn må max være 100 tegn'),
  email: z.string().email('Ugyldig email adresse'),
  subject: z.string().max(200, 'Emne må max være 200 tegn').optional(),
  message: z.string().min(10, 'Besked skal være mindst 10 tegn').max(2000, 'Besked må max være 2000 tegn'),
});

// Types
export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
export type CreateContactInput = z.infer<typeof createContactSchema>;

export interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  arrival_date: string;
  departure_date: string;
  num_people: number;
  message: string | null;
  status: 'pending' | 'confirmed' | 'declined' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: number;
  created_at: string;
}

export type InquiryStatus = Inquiry['status'];

// Gallery validation schemas
export const createGalleryImageSchema = z.object({
  title: z.string().min(1, 'Titel er påkrævet').max(255, 'Titel må max være 255 tegn'),
  description: z.string().max(1000, 'Beskrivelse må max være 1000 tegn').optional(),
  image_url: z.string().url('Ugyldig URL').optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0, 'Sort order skal være positiv').default(0),
});

export const updateGalleryImageSchema = createGalleryImageSchema.partial();

export const reorderGallerySchema = z.object({
  imageIds: z.array(z.number().int().positive()).min(1, 'Mindst ét billede ID er påkrævet'),
});

// Admin validation schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Brugernavn er påkrævet'),
  password: z.string().min(1, 'Password er påkrævet'),
});

export const createAdminUserSchema = z.object({
  username: z.string().min(3, 'Brugernavn skal være mindst 3 tegn').max(100, 'Brugernavn må max være 100 tegn'),
  email: z.string().email('Ugyldig email adresse'),
  password: z.string().min(6, 'Password skal være mindst 6 tegn'),
  is_active: z.boolean().default(true),
});

// Types
export type CreateGalleryImageInput = z.infer<typeof createGalleryImageSchema>;
export type UpdateGalleryImageInput = z.infer<typeof updateGalleryImageSchema>;
export type ReorderGalleryInput = z.infer<typeof reorderGallerySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;

export interface GalleryImage {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  file_path: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}
