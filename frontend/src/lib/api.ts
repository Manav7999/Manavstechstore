import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token automatically
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('manavstech_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  _count?: { apps: number };
}

export interface Screenshot {
  id: string;
  appId: string;
  url: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface Review {
  id: string;
  appId: string;
  userId: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  developerReply?: string;
  createdAt: string;
  user: User;
}

export interface AppData {
  id: string;
  name: string;
  packageName: string;
  shortDescription: string;
  description: string;
  versionName: string;
  versionCode: number;
  apkUrl: string;
  iconUrl: string;
  bannerUrl?: string;
  appSize: string;
  minAndroid: string;
  targetAndroid: string;
  rating: number;
  downloadsCount: number;
  isAiPowered: boolean;
  isOffline: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isEditorsChoice: boolean;
  supportEmail?: string;
  websiteUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  categoryId: string;
  category?: Category;
  screenshots?: Screenshot[];
  reviews?: Review[];
}

export interface BlogData {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

// API methods
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) localStorage.setItem('manavstech_token', res.data.token);
    return res.data;
  },
  register: async (email: string, password: string, name: string) => {
    const res = await api.post('/auth/register', { email, password, name });
    if (res.data.token) localStorage.setItem('manavstech_token', res.data.token);
    return res.data;
  },
  socialLogin: async (email: string, name: string, provider: string, providerId: string) => {
    const res = await api.post('/auth/social-login', { email, name, provider, providerId });
    if (res.data.token) localStorage.setItem('manavstech_token', res.data.token);
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('manavstech_token');
  },
};

export const appsApi = {
  getAll: async (params?: {
    category?: string;
    search?: string;
    sort?: string;
    offline?: boolean;
    aiPowered?: boolean;
    featured?: boolean;
    trending?: boolean;
    editorsChoice?: boolean;
  }) => {
    const res = await api.get<AppData[]>('/apps', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<{ app: AppData; relatedApps: AppData[] }>(`/apps/${id}`);
    return res.data;
  },
  aiSearch: async (query: string) => {
    const res = await api.post<{ app: AppData; score: number }[]>('/apps/ai-search', { query });
    return res.data;
  },
  getRecommendations: async (downloadHistoryPackNames: string[]) => {
    const res = await api.post<AppData[]>('/apps/recommendations', { downloadHistoryPackNames });
    return res.data;
  },
  create: async (formData: FormData) => {
    const res = await api.post<AppData>('/apps', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  update: async (id: string, formData: FormData) => {
    const res = await api.put<AppData>(`/apps/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/apps/${id}`);
    return res.data;
  },
  getDownloadUrl: (id: string, userId?: string) => {
    const query = userId ? `?userId=${userId}` : '';
    return `${API_BASE_URL}/apps/${id}/download${query}`;
  },
};

export const categoriesApi = {
  getAll: async () => {
    const res = await api.get<Category[]>('/categories');
    return res.data;
  },
};

export const reviewsApi = {
  create: async (appId: string, rating: number, comment: string) => {
    const res = await api.post<Review>(`/reviews/${appId}`, { rating, comment });
    return res.data;
  },
  upvote: async (reviewId: string) => {
    const res = await api.post<Review>(`/reviews/${reviewId}/helpful`);
    return res.data;
  },
  reply: async (reviewId: string, reply: string) => {
    const res = await api.post<Review>(`/reviews/${reviewId}/reply`, { reply });
    return res.data;
  },
};

export const wishlistApi = {
  add: async (appId: string) => {
    const res = await api.post(`/wishlist/${appId}`);
    return res.data;
  },
  remove: async (appId: string) => {
    const res = await api.delete(`/wishlist/${appId}`);
    return res.data;
  },
};

export const blogApi = {
  getAll: async () => {
    const res = await api.get<BlogData[]>('/blog');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<BlogData>(`/blog/${id}`);
    return res.data;
  },
  create: async (title: string, content: string, imageUrl?: string) => {
    const res = await api.post<BlogData>('/blog', { title, content, imageUrl });
    return res.data;
  },
  update: async (id: string, title: string, content: string, imageUrl?: string) => {
    const res = await api.put<BlogData>(`/blog/${id}`, { title, content, imageUrl });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/blog/${id}`);
    return res.data;
  },
};
