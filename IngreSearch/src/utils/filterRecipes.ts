
import { Recipe, RECIPES } from '../data/recipes';

export function filterRecipes(recipes: Recipe[], input: string, mode: 'normal' | 'ahorro'): Recipe[] {
  const tokens = input
    .toLowerCase()
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  const byIngredients = tokens.length
    ? recipes.filter(r => tokens.every(t => r.ingredients.map(i => i.toLowerCase()).includes(t)))
    : recipes;

  const byMode =
    mode === 'ahorro'
      ? byIngredients.filter(r => r.priceTag === 'bajo')
      : byIngredients;

  return byMode;
}