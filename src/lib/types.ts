export interface Product {
  id: string;
  name: string;
  tagline?: string;
  imageUrl: string;
  imageHint: string;
  sizes?: string[];
}

export interface SubCategory {
  id: string;
  name: string;
  href: string;
  imageUrl?: string;
  imageHint?: string;
  sizes?: string[];
}

export interface Category {
  id:string;
  name: string;
  imageUrl: string;
  imageHint: string;
  href: string;
  subcategories?: SubCategory[];
}

export interface HeroProduct extends Product {
  // Currently same as Product, can be extended
}

export interface SiteContent {
  heroProducts: HeroProduct[];
  categories: Category[];
}

export interface Order {
  id: string;
  productName: string;
  quantity: number;
  date: string; // ISO 8601 format
  imageUrl: string;
  size?: string;
}

export interface CartItem extends Product {
    quantity: number;
    size?: string;
}
