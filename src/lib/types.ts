export interface Product {
  id: string;
  name: string;
  tagline?: string;
  imageUrl: string;
  imageHint: string;
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  imageHint: string;
  href: string;
}
