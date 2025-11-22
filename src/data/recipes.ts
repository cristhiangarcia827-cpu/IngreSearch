
export type Recipe = {
  id: string;
  title: string;
  ingredients: string[];
  steps: string[];
  priceTag: 'bajo' | 'medio' | 'alto';
};

export const RECIPES: Recipe[] = [
  {
    id: 'r1',
    title: 'Arroz con huevo y tomate',
    ingredients: ['arroz', 'huevo', 'tomate', 'aceite', 'sal'],
    steps: ['Cocina el arroz', 'Fríe el huevo', 'Saltea el tomate', 'Mezcla todo y sazona'],
    priceTag: 'bajo'
  },
  {
    id: 'r2',
    title: 'Pasta al ajo',
    ingredients: ['pasta', 'ajo', 'aceite', 'sal'],
    steps: ['Hierve la pasta', 'Dora el ajo', 'Mezcla con aceite', 'Sirve'],
    priceTag: 'medio'
  },
  {
    id: 'r3',
    title: 'Ensalada simple',
    ingredients: ['lechuga', 'tomate', 'aceite', 'sal'],
    steps: ['Lava y corta', 'Aliña', 'Mezcla y sirve'],
    priceTag: 'bajo'
  }
];