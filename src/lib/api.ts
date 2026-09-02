import type {
  BlogPost,
  Certificate,
  Collection,
  ContactMessage,
  ContactSettings,
  DownloadFile,
  HeroSettings,
  Product,
  ProductCategory,
  Project,
  Role,
} from "@/types";
import { getApiBaseUrl } from "@/lib/api-base-url";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("comfort-auth");
    if (!raw) return null;
    type StoredAuth = { state?: { token?: string }; token?: string } | null;
    const parsed = JSON.parse(raw) as StoredAuth;
    return parsed?.state?.token ?? parsed?.token ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
  });

  if (response.status === 204) return undefined as T;

  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
    error?: string;
  };
  if (!response.ok) {
    const serverMessage = data.error || data.message;
    const message =
      typeof serverMessage === "string" && serverMessage.trim()
        ? serverMessage
        : response.status === 401 || response.status === 403
          ? "Unauthorized"
          : response.status === 404
            ? "Not found"
            : response.status >= 500
              ? "Service unavailable"
              : "Request failed";
    throw new ApiError(message, response.status);
  }
  return data as T;
}

export async function apiGet<T>(path: string): Promise<T | null> {
  try {
    return await apiFetch<T>(path);
  } catch {
    return null;
  }
}

export const catalogApi = {
  products: () => apiGet<Product[]>("/products"),
  product: (slug: string) => apiGet<Product>(`/products/${slug}`),
  categories: () => apiGet<ProductCategory[]>("/categories"),
  category: (slug: string) => apiGet<ProductCategory>(`/categories/${slug}`),
  collections: () => apiGet<Collection[]>("/collections"),
  collection: (slug: string) => apiGet<Collection>(`/collections/${slug}`),
  projects: () => apiGet<Project[]>("/projects"),
  project: (slug: string) => apiGet<Project>(`/projects/${slug}`),
  posts: () => apiGet<BlogPost[]>("/blog"),
  post: (slug: string) => apiGet<BlogPost>(`/blog/${slug}`),
  certificates: () => apiGet<Certificate[]>("/certificates"),
  certificate: (id: string) => apiGet<Certificate>(`/certificates/${id}`),
  downloads: (publicOnly = false) =>
    apiGet<DownloadFile[]>(`/downloads${publicOnly ? "?public=true" : ""}`),
  download: (id: string) => apiGet<DownloadFile>(`/downloads/${id}`),
  contactSettings: () => apiGet<ContactSettings>("/settings/contact"),
  heroSettings: () => apiGet<HeroSettings>("/settings/hero"),
};

export const adminApi = {
  products: () => apiFetch<Product[]>("/products"),
  product: (id: string) => apiFetch<Product>(`/products/${id}`),
  categories: () => apiFetch<ProductCategory[]>("/categories"),
  collections: () => apiFetch<Collection[]>("/collections"),
  createProduct: (payload: Partial<Product>) =>
    apiFetch<Product>("/products", { method: "POST", body: JSON.stringify(payload) }),
  updateProduct: (id: string, payload: Partial<Product>) =>
    apiFetch<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteProduct: (id: string) =>
    apiFetch<void>(`/products/${id}`, { method: "DELETE" }),
  createCategory: (payload: Partial<ProductCategory>) =>
    apiFetch<ProductCategory>("/categories", { method: "POST", body: JSON.stringify(payload) }),
  updateCategory: (id: string, payload: Partial<ProductCategory>) =>
    apiFetch<ProductCategory>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteCategory: (id: string) =>
    apiFetch<void>(`/categories/${id}`, { method: "DELETE" }),
  createCollection: (payload: Partial<Collection>) =>
    apiFetch<Collection>("/collections", { method: "POST", body: JSON.stringify(payload) }),
  updateCollection: (id: string, payload: Partial<Collection>) =>
    apiFetch<Collection>(`/collections/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteCollection: (id: string) =>
    apiFetch<void>(`/collections/${id}`, { method: "DELETE" }),
  createProject: (payload: Partial<Project>) =>
    apiFetch<Project>("/projects", { method: "POST", body: JSON.stringify(payload) }),
  updateProject: (id: string, payload: Partial<Project>) =>
    apiFetch<Project>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteProject: (id: string) =>
    apiFetch<void>(`/projects/${id}`, { method: "DELETE" }),
  createPost: (payload: Partial<BlogPost>) =>
    apiFetch<BlogPost>("/blog", { method: "POST", body: JSON.stringify(payload) }),
  updatePost: (id: string, payload: Partial<BlogPost>) =>
    apiFetch<BlogPost>(`/blog/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deletePost: (id: string) =>
    apiFetch<void>(`/blog/${id}`, { method: "DELETE" }),
  users: () => apiFetch<AuthUser[]>("/users"),
  createCertificate: (payload: Partial<Certificate>) =>
    apiFetch<Certificate>("/certificates", { method: "POST", body: JSON.stringify(payload) }),
  updateCertificate: (id: string, payload: Partial<Certificate>) =>
    apiFetch<Certificate>(`/certificates/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteCertificate: (id: string) =>
    apiFetch<void>(`/certificates/${id}`, { method: "DELETE" }),
  createDownload: (payload: Partial<DownloadFile>) =>
    apiFetch<DownloadFile>("/downloads", { method: "POST", body: JSON.stringify(payload) }),
  updateDownload: (id: string, payload: Partial<DownloadFile>) =>
    apiFetch<DownloadFile>(`/downloads/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteDownload: (id: string) =>
    apiFetch<void>(`/downloads/${id}`, { method: "DELETE" }),
  contactMessages: () => apiFetch<ContactMessage[]>("/contact"),
  updateContactSettings: (payload: ContactSettings) =>
    apiFetch<ContactSettings>("/settings/contact", { method: "PUT", body: JSON.stringify(payload) }),
  updateHeroSettings: (payload: HeroSettings) =>
    apiFetch<HeroSettings>("/settings/hero", { method: "PUT", body: JSON.stringify(payload) }),
};

export async function uploadFile(file: File) {
  const body = new FormData();
  body.append("file", file);
  return apiFetch<{ id: string; name: string; url: string; size: number; type: string }>("/media", {
    method: "POST",
    body,
  });
}

export function loginRequest(email: string, password: string) {
  return apiFetch<{ token: string; user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function sendContact(payload: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
}) {
  return apiFetch<{ ok: boolean; id: string }>("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function saveCalculator(payload: {
  email?: string;
  input: unknown;
  result: unknown;
}) {
  return apiFetch<{ ok: boolean; id: string }>("/calculator", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
