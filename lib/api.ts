// API configuration and service functions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface LoginCredentials {
  email?: string;
  mobile?: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email?: string;
  mobile?: string;
  password: string;
  image?: File | string;
  address?: string;
  role?: 'user' | 'admin' | 'super_admin';
}

export interface AuthResponse {
  message: string;
  token: string;
  token_type: string;
  user: any;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

// Set auth token in localStorage
export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
};

// Remove auth token from localStorage
export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
};

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData (for file uploads)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!isJson) {
      // If not JSON, it might be HTML (error page) or empty
      const text = await response.text();
      throw {
        message: `Server returned non-JSON response (${response.status}). Please check if the API server is running at ${API_BASE_URL}`,
        errors: {},
        status: response.status,
        responseText: text.substring(0, 200), // First 200 chars for debugging
      } as ApiError & { status: number; responseText?: string };
    }

    // Parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      // If JSON parsing fails, throw a helpful error
      throw {
        message: `Invalid JSON response from server. Please check if the API server is running correctly at ${API_BASE_URL}`,
        errors: {},
        status: response.status,
      } as ApiError & { status: number };
    }

    if (!response.ok) {
      throw {
        message: data.message || 'An error occurred',
        errors: data.errors,
        status: response.status,
      } as ApiError & { status: number };
    }

    return data;
  } catch (error: any) {
    // Handle network errors
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      throw {
        message: `Network error: Unable to connect to API server at ${API_BASE_URL}. Please ensure the server is running.`,
        errors: {},
        status: 0,
      } as ApiError & { status: number };
    }
    // Re-throw if it's already our custom error format
    if (error.status !== undefined) {
      throw error;
    }
    // Handle other errors
    throw {
      message: error.message || 'An unexpected error occurred',
      errors: {},
      status: 0,
    } as ApiError & { status: number };
  }
}

// Authentication API functions
export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.email) formData.append('email', data.email);
    if (data.mobile) formData.append('mobile', data.mobile);
    formData.append('password', data.password);
    if (data.image instanceof File) {
      formData.append('image', data.image);
    } else if (data.image) {
      formData.append('image', data.image);
    }
    if (data.address) formData.append('address', data.address);
    if (data.role) formData.append('role', data.role);

    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: formData,
    });
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: async (): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },

  me: async (): Promise<{ user: any }> => {
    return apiRequest<{ user: any }>('/auth/me');
  },

  updateProfile: async (data: Partial<RegisterData>): Promise<{ message: string; user: any }> => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.email !== undefined) formData.append('email', data.email || '');
    if (data.mobile !== undefined) formData.append('mobile', data.mobile || '');
    if (data.password) formData.append('password', data.password);
    if (data.image instanceof File) {
      formData.append('image', data.image);
    } else if (data.image) {
      formData.append('image', data.image);
    }
    if (data.address !== undefined) formData.append('address', data.address || '');

    return apiRequest<{ message: string; user: any }>('/auth/profile', {
      method: 'PUT',
      body: formData,
    });
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// User management API functions (admin only)
export const userApi = {
  getAll: async (page: number = 1): Promise<{
    data: any[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  }> => {
    return apiRequest(`/users?page=${page}`);
  },

  updateRole: async (userId: number, role: 'user' | 'admin' | 'super_admin'): Promise<{
    message: string;
    user: any;
  }> => {
    return apiRequest(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  delete: async (userId: number): Promise<{ message: string }> => {
    return apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  },
};

// Quiz API functions
export const quizApi = {
  // Public endpoint (no auth required)
  getPublicQuizzes: async (): Promise<any[]> => {
    return apiRequest('/quizzes/public');
  },

  // Authenticated endpoints
  getQuizzes: async (): Promise<any[]> => {
    return apiRequest('/quizzes');
  },

  getQuiz: async (quizId: number): Promise<{ quiz: any; has_participated: boolean; submission_id?: number }> => {
    return apiRequest(`/quizzes/${quizId}`);
  },

  startQuiz: async (quizId: number): Promise<{
    message: string;
    submission: any;
    one_time: boolean;
    warning_message: string;
  }> => {
    return apiRequest(`/quizzes/${quizId}/start`, {
      method: 'POST',
    });
  },

  getLeaderboard: async (quizId: number): Promise<{
    leaderboard: any[];
    stats: any;
  }> => {
    return apiRequest(`/quizzes/${quizId}/leaderboard`);
  },

  // Admin endpoints
  admin: {
    getQuizzes: async (params?: { status?: string; created_by?: number; page?: number }): Promise<{
      data: any[];
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    }> => {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.created_by) queryParams.append('created_by', params.created_by.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      return apiRequest(`/admin/quizzes?${queryParams.toString()}`);
    },

    createQuiz: async (data: {
      title: string;
      description?: string;
      time_limit_minutes?: number;
      start_time: string;
      end_time: string;
      show_correct_answer?: boolean;
      total_points: number;
      status?: 'draft' | 'published' | 'closed';
      questions?: Array<{
        question_text: string;
        question_type: 'mcq' | 'descriptive';
        points: number;
        order_index?: number;
        is_required?: boolean;
        options?: Array<{
          option_text: string;
          is_correct?: boolean;
          order_index?: number;
        }>;
      }>;
    }): Promise<{ message: string; quiz: any }> => {
      return apiRequest('/admin/quizzes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getQuiz: async (quizId: number): Promise<any> => {
      return apiRequest(`/admin/quizzes/${quizId}`);
    },

    updateQuiz: async (quizId: number, data: Partial<any>): Promise<{ message: string; quiz: any }> => {
      return apiRequest(`/admin/quizzes/${quizId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    deleteQuiz: async (quizId: number): Promise<{ message: string }> => {
      return apiRequest(`/admin/quizzes/${quizId}`, {
        method: 'DELETE',
      });
    },

    publishQuiz: async (quizId: number, data?: { show_correct_answer?: boolean }): Promise<{ message: string; quiz: any }> => {
      return apiRequest(`/admin/quizzes/${quizId}/publish`, {
        method: 'POST',
        body: JSON.stringify(data || {}),
      });
    },

    publishResults: async (quizId: number): Promise<{ message: string; quiz: any }> => {
      return apiRequest(`/admin/quizzes/${quizId}/publish-results`, {
        method: 'POST',
      });
    },

    addQuestions: async (quizId: number, questions: Array<{
      question_text: string;
      question_type: 'mcq' | 'descriptive';
      points: number;
      order_index?: number;
      is_required?: boolean;
      options?: Array<{
        option_text: string;
        is_correct?: boolean;
        order_index?: number;
      }>;
    }>): Promise<{ message: string; questions: any[] }> => {
      return apiRequest(`/admin/quizzes/${quizId}/questions`, {
        method: 'POST',
        body: JSON.stringify({ questions }),
      });
    },

    updateQuestion: async (questionId: number, data: Partial<any>): Promise<{ message: string; question: any }> => {
      return apiRequest(`/admin/questions/${questionId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    deleteQuestion: async (questionId: number): Promise<{ message: string }> => {
      return apiRequest(`/admin/questions/${questionId}`, {
        method: 'DELETE',
      });
    },

    getSubmissions: async (quizId: number, params?: { status?: string; page?: number }): Promise<{
      data: any[];
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    }> => {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.page) queryParams.append('page', params.page.toString());
      return apiRequest(`/admin/quizzes/${quizId}/submissions?${queryParams.toString()}`);
    },

    getSubmission: async (quizId: number, submissionId: number): Promise<any> => {
      return apiRequest(`/admin/quizzes/${quizId}/submissions/${submissionId}`);
    },

    gradeDescriptive: async (submissionId: number, answerId: number, data: {
      score_awarded: number;
      is_correct?: boolean;
      feedback?: string;
    }): Promise<{ message: string; answer: any; submission: any }> => {
      return apiRequest(`/admin/submissions/${submissionId}/grade-descriptive/${answerId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    batchGrade: async (submissionId: number, grades: Array<{
      answer_id: number;
      score_awarded: number;
      is_correct?: boolean;
      feedback?: string;
    }>): Promise<{ message: string; submission: any }> => {
      return apiRequest(`/admin/submissions/${submissionId}/batch-grade`, {
        method: 'POST',
        body: JSON.stringify({ grades }),
      });
    },
  },
};

// Submission API functions
export const submissionApi = {
  saveAnswer: async (submissionId: number, data: {
    question_id: number;
    selected_option_id?: number;
    answer_text?: string;
  }): Promise<{ message: string; answer: any }> => {
    return apiRequest(`/submissions/${submissionId}/answer`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  submit: async (submissionId: number): Promise<{
    message: string;
    submission: any;
    total_score: number;
    show_score: boolean;
  }> => {
    return apiRequest(`/submissions/${submissionId}/submit`, {
      method: 'POST',
    });
  },

  getSubmission: async (submissionId: number): Promise<{
    submission: any;
    show_answers: boolean;
    show_correct_answers: boolean;
  }> => {
    return apiRequest(`/submissions/${submissionId}`);
  },
};