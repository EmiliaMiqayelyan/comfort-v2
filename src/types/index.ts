export type Locale = "am" | "ru" | "en";

export type Role =
  | "admin"
  | "manager"
  | "editor"
  | "translator"
  | "dealer";

export interface LocalizedString {
  am: string;
  ru: string;
  en: string;
}

export interface ProductCategory {
  id: string;
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  image: string;
  parentId?: string | null;
  productCount: number;
}

export interface Certificate {
  id: string;
  title: LocalizedString;
  issuer?: string;
  year?: number;
  fileUrl: string;
  image?: string;
}

export type DownloadCategory =
  | "catalogs"
  | "templates"
  | "collections"
  | "pdf"
  | "cad"
  | "bim"
  | "guides"
  | "other";

export interface DownloadFile {
  id: string;
  filename: string;
  title: LocalizedString;
  category: DownloadCategory;
  url: string;
  size?: string;
  downloadable: boolean;
}

export interface ContactShowroom {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone?: string;
}

export interface ContactSocial {
  id: string;
  label: string;
  href: string;
}

export interface ContactSettings {
  phones: string[];
  emails: string[];
  address: LocalizedString;
  hours: LocalizedString;
  socials: ContactSocial[];
  showrooms: ContactShowroom[];
}

export interface HeroSettings {
  /** Ordered hero slider images (local `/uploads/...` or absolute URLs). */
  images: string[];
  /** @deprecated Prefer `images[0]` — kept for older payloads. */
  image?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  created_at?: string;
}

export interface Collection {
  id: string;
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  image: string;
  style: string;
  productCount: number;
}

export interface ProductSpec {
  key: string;
  label: LocalizedString;
  value: string;
  unit?: string;
}

export interface ProductDownload {
  id: string;
  type: "pdf" | "dwg" | "bim" | "3ds" | "sketchup" | "texture" | "guide";
  label: LocalizedString;
  url: string;
  size?: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: LocalizedString;
  description: LocalizedString;
  categoryId: string;
  collectionId: string;
  images: string[];
  modelUrl?: string;
  videoUrl?: string;
  height: number;
  width: number;
  depth: number;
  length: number;
  material: string;
  finish: string;
  colors: ProductColor[];
  /** Color variants for the product gallery image (separate from 3D viewer colors). */
  galleryVariants?: ProductGalleryVariant[];
  textures: ProductTexture[];
  specs: ProductSpec[];
  downloads: ProductDownload[];
  price: number;
  featured?: boolean;
  availability: "in_stock" | "limited" | "preorder";
}

export interface ProductGalleryVariant {
  id: string;
  name: LocalizedString;
  /** Small swatch shown in the variants strip. */
  thumbUrl: string;
  /** Large image shown in the main gallery when the swatch is selected. */
  imageUrl: string;
}

export interface ProductColor {
  id: string;
  name: LocalizedString;
  hex: string;
}

export interface ProductTexture {
  id: string;
  name: LocalizedString;
  mapUrl: string;
  previewUrl: string;
}

export interface Project {
  id: string;
  slug: string;
  title: LocalizedString;
  description: LocalizedString;
  location: LocalizedString;
  year: number;
  images: string[];
  beforeImage?: string;
  afterImage?: string;
  videoUrl?: string;
  products: string[];
  category: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString;
  coverImage: string;
  category: string;
  tags: string[];
  author: Author;
  publishedAt: string;
}

export interface Author {
  id: string;
  name: string;
  avatar: string;
  role: LocalizedString;
}

export interface CalculatorInput {
  perimeter: number;
  wallHeight: number;
  doorCount: number;
  windowCount: number;
  profileType: string;
  cornerType: string;
  includeAdhesive: boolean;
  wastePercent: number;
}

export interface CalculatorResult {
  pieces: number;
  connectors: number;
  innerCorners: number;
  outerCorners: number;
  adhesiveKg: number;
  totalLength: number;
  estimatedPrice: number;
  wasteMeters: number;
}

export interface ConfiguratorState {
  collectionId: string | null;
  modelId: string | null;
  colorId: string | null;
  finishId: string | null;
  materialId: string | null;
  textureId: string | null;
  ledProfile: boolean;
  cornerAccessories: string[];
  connectors: string[];
}

export interface VisualizerState {
  roomImage: string | null;
  presetId: string | null;
  baseboardId: string | null;
  panelId: string | null;
  moldingId: string | null;
  wallColor: string;
  floorId: string | null;
  lighting: "day" | "evening" | "warm" | "cool";
  showBefore: boolean;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: "image" | "video" | "pdf" | "glb" | "usdz" | "texture";
  url: string;
  folder: string;
  size: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
}
