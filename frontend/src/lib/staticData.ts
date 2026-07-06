// Static data layer — used as primary source on Vercel (no backend needed)
import type { AppData, Category } from './api';

let _cache: { apps: AppData[]; categories: Category[] } | null = null;

export async function getStaticData(): Promise<{ apps: AppData[]; categories: Category[] }> {
  if (_cache) return _cache;
  try {
    const res = await fetch('/data/apps.json');
    if (!res.ok) throw new Error('Static data not found');
    _cache = await res.json();
    return _cache!;
  } catch {
    return { apps: [], categories: [] };
  }
}

export async function getStaticApps(filters?: {
  featured?: boolean;
  trending?: boolean;
  editorsChoice?: boolean;
  category?: string;
  search?: string;
  offline?: boolean;
  aiPowered?: boolean;
}): Promise<AppData[]> {
  const { apps } = await getStaticData();
  let result = [...apps];

  if (filters?.featured) result = result.filter(a => a.isFeatured);
  if (filters?.trending) result = result.filter(a => a.isTrending);
  if (filters?.editorsChoice) result = result.filter(a => a.isEditorsChoice);
  if (filters?.offline) result = result.filter(a => a.isOffline);
  if (filters?.aiPowered) result = result.filter(a => a.isAiPowered);
  if (filters?.category) result = result.filter(a => a.category?.slug === filters.category);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.shortDescription.toLowerCase().includes(q) ||
      a.packageName.toLowerCase().includes(q)
    );
  }
  return result;
}

export async function getStaticAppById(id: string): Promise<{ app: AppData; relatedApps: AppData[] } | null> {
  const { apps } = await getStaticData();
  const app = apps.find(a => a.id === id);
  if (!app) return null;
  const relatedApps = apps.filter(a => a.id !== id && a.categoryId === app.categoryId);
  return { app, relatedApps };
}

export async function getStaticCategories(): Promise<Category[]> {
  const { categories } = await getStaticData();
  return categories;
}
