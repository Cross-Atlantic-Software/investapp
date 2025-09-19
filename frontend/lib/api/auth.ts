// Get API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888/api';

export interface AuthResponse {
  status: boolean;
  message: string;
  token?: string;
  data?: {
    role: number;
    auth_provider: string;
    status: number;
    email_verified: number;
    phone_verified: number;
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    created_at: string;
    updated_at: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  // Alternative field names that some backends expect
  username?: string;
  user_email?: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
  token?: string;
}

export interface CompleteProfileRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  source: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

class AuthApiError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    // Only log detailed error info in development and for non-expected errors
    if (process.env.NODE_ENV === 'development' && response.status >= 500) {
      console.error('API Error:', errorData);
      console.error('Response status:', response.status);
      
      // Safely log response headers only for server errors
      try {
        const headersObj = Object.fromEntries(response.headers.entries());
        if (Object.keys(headersObj).length > 0) {
          console.error('Response headers:', headersObj);
        }
      } catch {
        // Silently ignore header logging errors
      }
    }
    
    throw new AuthApiError(errorData.message || 'Request failed', response.status);
  }
  
  return response.json();
}

export const authApi = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      return handleResponse<AuthResponse>(response);
    } catch (error) {
      if (error instanceof AuthApiError) {
        throw error;
      }
      throw new AuthApiError('Network error occurred');
    }
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      return handleResponse<AuthResponse>(response);
    } catch (error) {
      if (error instanceof AuthApiError) {
        throw error;
      }
      throw new AuthApiError('Network error occurred');
    }
  },

  async verifyEmail(data: VerifyEmailRequest): Promise<AuthResponse> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add token to headers if available
      if (data.token) {
        headers['Authorization'] = `Bearer ${data.token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: data.email,
          code: data.code,
        }),
      });
      
      return handleResponse<AuthResponse>(response);
    } catch (error) {
      if (error instanceof AuthApiError) {
        throw error;
      }
      throw new AuthApiError('Network error occurred');
    }
  },

  async completeProfile(data: CompleteProfileRequest): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('pending_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/complete-profile`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        // If 401, try without token (temporary workaround)
        if (response.status === 401) {
          const responseWithoutAuth = await fetch(`${API_BASE_URL}/auth/complete-profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          
          return handleResponse<AuthResponse>(responseWithoutAuth);
        }
      }
      
      return handleResponse<AuthResponse>(response);
    } catch (error) {
      if (error instanceof AuthApiError) {
        throw error;
      }
      throw new AuthApiError('Network error occurred');
    }
  },

  async googleAuth(): Promise<{ authUrl: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return handleResponse<{ authUrl: string }>(response);
    } catch (error) {
      if (error instanceof AuthApiError) {
        throw error;
      }
      throw new AuthApiError('Network error occurred');
    }
  },

  async googleTokenVerify(data: GoogleAuthRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      return handleResponse<AuthResponse>(response);
    } catch (error) {
      if (error instanceof AuthApiError) {
        throw error;
      }
      throw new AuthApiError('Google authentication failed');
    }
  },
};

export { AuthApiError };
