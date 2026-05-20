import { FULL_INVENTORY } from './inventory_data';

export const FALLBACK_PRODUCTS = FULL_INVENTORY.map(p => ({ ...p, stock: 100, is_active: true }));

export const VERIFIED_INVENTORY = FALLBACK_PRODUCTS.map(p => ({
  id: p.id,
  name: p.name,
  category: p.category,
  price: p.price,
  image_url: p.image_url,
  description: p.description,
  stock: 100,
  unit: p.unit,
  is_active: true,
  is_seasonal: p.is_seasonal || false
}));

export const getRelatedFallback = (category: string, excludeId: string, limit: number = 8) => {
  return FALLBACK_PRODUCTS
    .filter(p => p.category === category && p.id !== excludeId)
    .slice(0, limit);
};

export const getSmartRecommendations = (product: any, limit: number = 24) => {
  if (!product) return FALLBACK_PRODUCTS.slice(0, limit);
  const paired = FALLBACK_PRODUCTS.filter(p => product.pairsWith?.includes(p.id));
  const tagged = FALLBACK_PRODUCTS.filter(p => p.id !== product.id && p.tags?.some(tag => product.tags?.some((t: string) => p.tags?.includes(t))) && !paired.some((pp: any) => pp.id === p.id));
  const categorized = FALLBACK_PRODUCTS.filter(p => p.id !== product.id && p.category === product.category && !paired.some((pp: any) => pp.id === p.id) && !tagged.some((pp: any) => pp.id === p.id));
  return [...paired, ...tagged, ...categorized].slice(0, limit);
};

export const getTrendingProducts = (limit: number = 12, excludeIds: string[] = []) => {
  return FALLBACK_PRODUCTS.filter(p => !excludeIds.includes(p.id)).sort(() => 0.5 - Math.random()).slice(0, limit);
};
