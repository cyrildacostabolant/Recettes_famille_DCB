
export interface Category {
  id: string;
  name: string;
  color: string;
  created_at?: string;
}

export interface Recipe {
  id: string;
  title: string;
  category: string; // Nom de la catégorie
  ingredients: string[];
  instructions: string[];
  image_url: string;
  created_at: string;
}
