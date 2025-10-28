import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { config } from './config';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Website,
  WebsiteRequest,
  ComponentRegistry,
  WebsiteComponent,
  WebsiteComponentRequest,
  Product,
  ProductRequest,
  Media,
  ApiResponse,
} from '@/types';

class ApiClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: config.apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const { data } = await axios.post<AuthResponse>(
                `${config.apiUrl}/auth/refresh`,
                null,
                { params: { refreshToken } }
              );

              this.setToken(data.accessToken);
              this.setRefreshToken(data.refreshToken);

              originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            this.clearAuth();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  private setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private setRefreshToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token);
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  private clearAuth() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  // Authentication APIs
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', data);
    this.setToken(response.data.accessToken);
    this.setRefreshToken(response.data.refreshToken);
    return response.data;
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', { username, password });
    this.setToken(response.data.accessToken);
    this.setRefreshToken(response.data.refreshToken);
    return response.data;
  }

  logout() {
    this.clearAuth();
  }

  // Website APIs
  async getWebsites(): Promise<Website[]> {
    const response = await this.api.get<Website[]>('/websites');
    return response.data;
  }

  async getWebsiteById(id: number): Promise<Website> {
    const response = await this.api.get<Website>(`/websites/${id}`);
    return response.data;
  }

  async getWebsiteBySubdomain(subdomain: string): Promise<Website> {
    const response = await this.api.get<Website>(`/websites/subdomain/${subdomain}`);
    return response.data;
  }

  async createWebsite(data: WebsiteRequest): Promise<Website> {
    const response = await this.api.post<Website>('/websites', data);
    return response.data;
  }

  async updateWebsite(id: number, data: WebsiteRequest): Promise<Website> {
    const response = await this.api.put<Website>(`/websites/${id}`, data);
    return response.data;
  }

  async deleteWebsite(id: number): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/websites/${id}`);
    return response.data;
  }

  // Component Registry APIs
  async getActiveComponents(): Promise<ComponentRegistry[]> {
    const response = await this.api.get<ComponentRegistry[]>('/components');
    return response.data;
  }

  async getComponentById(id: number): Promise<ComponentRegistry> {
    const response = await this.api.get<ComponentRegistry>(`/components/${id}`);
    return response.data;
  }

  async getComponentsByCategory(category: string): Promise<ComponentRegistry[]> {
    const response = await this.api.get<ComponentRegistry[]>(`/components/category/${category}`);
    return response.data;
  }

  // Admin - Component Registry APIs
  async createComponent(data: any): Promise<ComponentRegistry> {
    const response = await this.api.post<ComponentRegistry>('/admin/components', data);
    return response.data;
  }

  async getAllComponents(): Promise<ComponentRegistry[]> {
    const response = await this.api.get<ComponentRegistry[]>('/admin/components');
    return response.data;
  }

  async updateComponent(id: number, data: any): Promise<ComponentRegistry> {
    const response = await this.api.put<ComponentRegistry>(`/admin/components/${id}`, data);
    return response.data;
  }

  async deleteComponent(id: number): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/admin/components/${id}`);
    return response.data;
  }

  // Website Component APIs
  async getWebsiteComponents(websiteId: number): Promise<WebsiteComponent[]> {
    const response = await this.api.get<WebsiteComponent[]>(`/websites/${websiteId}/components`);
    return response.data;
  }

  async getVisibleComponents(websiteId: number): Promise<WebsiteComponent[]> {
    const response = await this.api.get<WebsiteComponent[]>(`/websites/${websiteId}/components/visible`);
    return response.data;
  }

  async addComponentToWebsite(websiteId: number, data: WebsiteComponentRequest): Promise<WebsiteComponent> {
    const response = await this.api.post<WebsiteComponent>(`/websites/${websiteId}/components`, data);
    return response.data;
  }

  async updateWebsiteComponent(websiteId: number, id: number, data: WebsiteComponentRequest): Promise<WebsiteComponent> {
    const response = await this.api.put<WebsiteComponent>(`/websites/${websiteId}/components/${id}`, data);
    return response.data;
  }

  async deleteWebsiteComponent(websiteId: number, id: number): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/websites/${websiteId}/components/${id}`);
    return response.data;
  }

  async reorderComponents(websiteId: number, componentIds: number[]): Promise<ApiResponse> {
    const response = await this.api.put<ApiResponse>(`/websites/${websiteId}/components/reorder`, componentIds);
    return response.data;
  }

  // Product APIs
  async getWebsiteProducts(websiteId: number): Promise<Product[]> {
    const response = await this.api.get<Product[]>(`/websites/${websiteId}/products`);
    return response.data;
  }

  async getAvailableProducts(websiteId: number): Promise<Product[]> {
    const response = await this.api.get<Product[]>(`/websites/${websiteId}/products/available`);
    return response.data;
  }

  async createProduct(websiteId: number, data: ProductRequest): Promise<Product> {
    const response = await this.api.post<Product>(`/websites/${websiteId}/products`, data);
    return response.data;
  }

  async updateProduct(websiteId: number, id: number, data: ProductRequest): Promise<Product> {
    const response = await this.api.put<Product>(`/websites/${websiteId}/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(websiteId: number, id: number): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/websites/${websiteId}/products/${id}`);
    return response.data;
  }

  // Media APIs
  async uploadMedia(websiteId: number, file: File): Promise<Media> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post<Media>(`/websites/${websiteId}/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getWebsiteMedia(websiteId: number): Promise<Media[]> {
    const response = await this.api.get<Media[]>(`/websites/${websiteId}/media`);
    return response.data;
  }

  async deleteMedia(id: number): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/media/${id}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
