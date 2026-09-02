export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: 'venta' | 'alquiler';
  category: 'casa' | 'apartamento' | 'terreno';
  images: string[];
  featured: boolean;
}

export interface Project {
  id: string;
  title: string;
  location: string;
  image: string;
  images?: string[];
}
