import api from '@/utils/api/api';
import { crossPlatformStorage } from '@/utils/storage/crossPlatformStorage';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  platform: string | null;
  api_key: string | null;
  photo_id: string | null;
  photo_url: string | null;
  demo_balance: string;
  is_robot_demo_active: boolean;
  is_robot_platform_active: boolean;
  /** Hanya ada di response profil (users/me), tidak ada di payload login. */
  preferred_currency?: string;
  demo_initial_capital?: string | null;
  /** Tanggal terakhir robot demo berjalan, format YYYY-MM-DD. */
  demo_robot_last_run_date?: string | null;
}

interface AuthResult {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}

export interface RegisterInput {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Authentication utility with cross-platform token management,
 * mengikuti kontrak response backend-treding-rust (users/*).
 */
export class AuthService {
  /**
   * Check if user is authenticated (has valid access token)
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await api.auth.getAccessToken();
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Register akun baru
   */
  static async register(input: RegisterInput) {
    const response = await api.post<AuthResult>('users/register', input);

    if (response.success && response.data) {
      await api.auth.setTokens(response.data.access_token, response.data.refresh_token);
      return { success: true, data: response.data };
    }

    return {
      success: false,
      message: response.message,
      fieldErrors: response.fieldErrors,
      error: response.error,
    };
  }

  /**
   * Login dengan email & password
   */
  static async login(input: LoginInput) {
    const response = await api.post<AuthResult>('users/login', input);

    if (response.success && response.data) {
      await api.auth.setTokens(response.data.access_token, response.data.refresh_token);
      return { success: true, data: response.data };
    }

    return {
      success: false,
      message: response.message,
      fieldErrors: response.fieldErrors,
      error: response.error,
    };
  }

  /**
   * Logout user dan hapus token tersimpan
   */
  static async logout(): Promise<void> {
    await api.auth.clearTokens();
  }

  /**
   * Ambil profil user yang sedang login
   */
  static async getCurrentUser() {
    return api.get<UserProfile>('users/profile');
  }

  /**
   * Update profil user (nama/email/phone/platform/api_key/api_secret/foto).
   * Backend menerima multipart/form-data.
   */
  static async updateProfile(formData: FormData) {
    return api.put<UserProfile>('users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  /**
   * Check if storage is working properly
   */
  static async checkStorageHealth(): Promise<boolean> {
    try {
      return await crossPlatformStorage.isAvailable();
    } catch (error) {
      console.error('Storage health check failed:', error);
      return false;
    }
  }
}

export default AuthService;
