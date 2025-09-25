
export interface ProductSize {
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name:string;
  tagline?: string;
  imageUrl: string;
  imageHint: string;
  price?: number;
  sizes?: ProductSize[];
}

export interface SubCategory {
  id: string;
  name: string;
  href: string;
  imageUrl?: string;
  imageHint?: string;
  price?: number;
  sizes?: ProductSize[];
}

export interface Category {
  id:string;
  name: string;
  imageUrl: string;
  imageHint: string;
  href: string;
  subcategories?: SubCategory[];
}

export interface HeroProduct extends Omit<Product, 'price' | 'sizes'> {
  // Hero products are for display. Price/size are sourced from the actual product.
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
  price?: number;
}

export interface CartItem extends Product {
    quantity: number;
    price: number;
    size?: string;
}
