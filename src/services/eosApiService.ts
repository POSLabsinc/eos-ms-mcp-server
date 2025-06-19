import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig, AxiosError } from 'axios';
import { 
  LoginRequest, 
  LoginResponse, 
  ApiResponse, 
  EOSApiError,
  User,
  InviteUserRequest 
} from '../types';

export class EOSApiService {
  private api: AxiosInstance;
  private authToken: string | null = null;

  constructor(baseURL: string = 'https://browserapi.eatos.net') {
    this.api = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        if (this.authToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response) {
          throw new EOSApiError(
            (error.response.data as any)?.message || 'API request failed',
            error.response.status,
            error.response.data
          );
        }
        throw new EOSApiError(
          error.message || 'Network error',
          0
        );
      }
    );
  }

  /**
   * Set authentication token for subsequent requests
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * User login
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.api.post<ApiResponse<LoginResponse>>('/user/login', credentials);
      
      if (response.data.success && response.data.data?.token) {
        this.setAuthToken(response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      if (error instanceof EOSApiError) {
        throw error;
      }
      throw new EOSApiError('Login failed', 500);
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.api.get<ApiResponse<User>>('/user/profile');
      return response.data.data!;
    } catch (error) {
      if (error instanceof EOSApiError) {
        throw error;
      }
      throw new EOSApiError('Failed to get user profile', 500);
    }
  }

  /**
   * Get all users (admin only)
   */
  async getUsers(): Promise<User[]> {
    try {
      const response = await this.api.get<ApiResponse<User[]>>('/users');
      return response.data.data || [];
    } catch (error) {
      if (error instanceof EOSApiError) {
        throw error;
      }
      throw new EOSApiError('Failed to get users', 500);
    }
  }

  /**
   * Invite a new user
   */
  async inviteUser(inviteData: InviteUserRequest): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>('/users/invite', inviteData);
      return response.data;
    } catch (error) {
      if (error instanceof EOSApiError) {
        throw error;
      }
      throw new EOSApiError('Failed to invite user', 500);
    }
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId: string, status: 'active' | 'inactive'): Promise<ApiResponse> {
    try {
      const response = await this.api.patch<ApiResponse>(`/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      if (error instanceof EOSApiError) {
        throw error;
      }
      throw new EOSApiError('Failed to update user status', 500);
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<ApiResponse> {
    try {
      const response = await this.api.delete<ApiResponse>(`/users/${userId}`);
      return response.data;
    } catch (error) {
      if (error instanceof EOSApiError) {
        throw error;
      }
      throw new EOSApiError('Failed to delete user', 500);
    }
  }

  /**
   * Health check for API connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.api.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }
} 