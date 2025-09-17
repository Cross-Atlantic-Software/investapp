const API_BASE_URL = 'http://localhost:8888/api'; // Make sure this matches your backend port

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
    console.error('API Error:', errorData); // Log the full error for debugging
    console.error('Response status:', response.status);
    console.error('Response headers:', Object.fromEntries(response.headers.entries()));
    throw new AuthApiError(errorData.message || 'Request failed', response.status);
  }
  
  return response.json();
}

export const authApi = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('Sending registration request to:', `${API_BASE_URL}/auth/register`);
      console.log('Request data:', data);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      return handleResponse<AuthResponse>(response);
    } catch (error) {
      console.error('Registration error:', error);
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
        console.log('Using token for complete profile:', token.substring(0, 20) + '...');
      } else {
        console.log('No token found for complete profile request - trying without authentication');
      }
      
      console.log('Sending complete profile request to:', `${API_BASE_URL}/auth/complete-profile`);
      console.log('Request data:', data);
      console.log('Headers:', headers);
      
      const response = await fetch(`${API_BASE_URL}/auth/complete-profile`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      
      console.log('Complete profile response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Complete profile error response:', errorText);
        
        // If 401, try without token (temporary workaround)
        if (response.status === 401) {
          console.log('Authentication failed, trying without token...');
          const responseWithoutAuth = await fetch(`${API_BASE_URL}/auth/complete-profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          
          console.log('Complete profile response without auth status:', responseWithoutAuth.status);
          return handleResponse<AuthResponse>(responseWithoutAuth);
        }
      }
      
      return handleResponse<AuthResponse>(response);
    } catch (error) {
      console.error('Complete profile error:', error);
      if (error instanceof AuthApiError) {
        throw error;
      }
      throw new AuthApiError('Network error occurred');
    }
  },
};

export { AuthApiError };
