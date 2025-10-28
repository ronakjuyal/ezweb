// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
}

// Website Types
export interface Website {
  id: number;
  subdomain: string;
  title: string;
  description?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteRequest {
  subdomain: string;
  title: string;
  description?: string;
  published?: boolean;
}

// Component Registry Types
export interface ComponentRegistry {
  id: number;
  name: string;
  description?: string;
  s3FileUrl: string;
  schema: string; // JSON string
  category?: string;
  version: string;
  active: boolean;
  createdAt: string;
}

export interface ComponentSchema {
  componentId: string;
  name: string;
  schema: {
    [key: string]: SchemaField;
  };
}

export interface SchemaField {
  type: 'text' | 'image' | 'multi-images' | 'color' | 'number' | 'boolean' | 'richtext' | 'url' | 'advanced' | 'select';
  default: any;
  editable?: boolean;
  label?: string;
  required?: boolean;
  validation?: any;
  maxImages?: number;  // for multi-images type
  schema?: { [key: string]: SchemaField };  // for advanced type (nested schema)
  description?: string;
  options?: string[];  // for select type (dropdown options)
}

// Website Component Types
export interface WebsiteComponent {
  id: number;
  websiteId: number;
  componentRegistry: ComponentRegistry;
  schemaData: string; // JSON string with customized values
  position: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteComponentRequest {
  componentRegistryId: number;
  schemaData: string; // JSON data
  position?: number;
  visible?: boolean;
}

// Product Types
export interface Product {
  id: number;
  websiteId: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock: number;
  available: boolean;
  category?: string;
  sku?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock?: number;
  available?: boolean;
  category?: string;
  sku?: string;
}

// Media Types
export interface Media {
  id: number;
  websiteId: number;
  filename: string;
  s3Url: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER';
  size: number;
  mimeType?: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: {
    [key: string]: string;
  };
}

// Dynamic Component Types
export interface DynamicComponentProps {
  componentData: any;
  schema: ComponentSchema;
  isEditable?: boolean;
}

export interface LoadedComponent {
  Component: React.ComponentType<any>;
  schema: ComponentSchema;
}
