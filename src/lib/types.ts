
export interface ProductSize {
  name?: string;
  price?: number;
}

export interface Product {
  id: string;
  name: string;
  tagline?: string;
  imageUrl: string;
  imageHint?: string;
  price?: number;
  sizes?: ProductSize[];
}

export interface SubCategory {
  id: string;
  name: string;
  href: string;
  tagline?: string;
  imageUrl?: string;
  imageHint?: string;
  price?: number;
  sizes?: ProductSize[];
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  imageHint?: string;
  href: string;
  subcategories?: SubCategory[];
}

export interface HeroProduct {
  productId: string; // The ID of the product from a category's subcategory
  // The following are overrides for the hero display
  tagline?: string;
  imageUrl?: string;
  imageHint?: string;
}

export interface SiteContent {
  heroProducts: HeroProduct[];
  categories: Category[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

export interface Address {
  id?: string;
  user_id?: string;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  email: string;
  is_default?: boolean;
  created_at?: string;
}

export interface Order {
  id: string;
  productName: string;
  quantity: number;
  date: string; // ISO 8601 format
  imageUrl: string;
  size?: string;
  price?: number;
  user_id?: string;
  address_id?: string;
}

export interface CartItem extends Product {
  quantity: number;
  price: number;
  size?: string;
}
