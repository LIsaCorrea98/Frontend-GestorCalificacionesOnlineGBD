// API base configuration
// Prioridad:
// 1. Variable de entorno VITE_API_URL (si está definida)
// 2. URL de producción: https://gestor-calificaciones.onrender.com/api (por defecto)
// Para desarrollo local, crear un archivo .env.local con: VITE_API_URL=http://localhost:8080/api
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gestor-calificaciones.onrender.com/api';

// Log para debugging (también en producción para verificar la URL)
console.log('🔧 API Base URL configurada:', API_BASE_URL);
console.log('🔧 Variable de entorno VITE_API_URL:', import.meta.env.VITE_API_URL || 'NO CONFIGURADA (usando default)');

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  // Handle empty responses (like 204 No Content)
  if (response.status === 204) {
    return {};
  }
  
  // Get the response text first
  const text = await response.text();
  
  // Try to parse JSON, but handle cases where response might not be JSON
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    // If it's not JSON, it might be a plain string error message
    if (response.ok) {
      // For successful responses that aren't JSON, return empty object
      return {};
    } else {
      // For error responses that aren't JSON, use the text as the error message
      data = { message: text || `HTTP error! status: ${response.status}` };
    }
  }
  
  if (!response.ok) {
    const errorMessage = data.message || data.error || text || `HTTP error! status: ${response.status}`;
    
    // Handle authentication errors
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    throw new Error(errorMessage);
  }
  return data;
};

// API client object
const api = {
  // Authentication
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  async register(userData) {
    const url = `${API_BASE_URL}/auth/register`;
    console.log('📤 Registrando usuario en:', url);
    console.log('📤 Datos enviados:', { ...userData, password: '***' });
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      console.log('📥 Respuesta del servidor:', response.status, response.statusText);
      return handleResponse(response);
    } catch (error) {
      console.error('❌ Error en registro:', error);
      // Si es un error de red (CORS, conexión, etc.)
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error(`No se pudo conectar con el servidor en ${url}. Verifique que el backend esté corriendo y accesible.`);
      }
      throw error;
    }
  },

  // Teacher endpoints
  async uploadCSV(file, courseCode, courseName, description) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseCode', courseCode);
    formData.append('courseName', courseName);
    formData.append('description', description);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/teacher/upload-csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return handleResponse(response);
  },

  async createCourse(courseData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicie sesión nuevamente.');
      }

      const response = await fetch(`${API_BASE_URL}/teacher/courses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(courseData)
      });
      return handleResponse(response);
    } catch (error) {
      // Si es un error de red (failed to fetch), dar un mensaje más claro
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('No se pudo conectar con el servidor. Verifique que el backend esté corriendo en http://localhost:8080');
      }
      throw error;
    }
  },

  async getTeacherCourses() {
    const response = await fetch(`${API_BASE_URL}/teacher/courses`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async getCourseDetails(courseId) {
    const response = await fetch(`${API_BASE_URL}/teacher/courses/${courseId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async getCourseStatistics(courseId) {
    const response = await fetch(`${API_BASE_URL}/teacher/courses/${courseId}/statistics`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Student endpoints
  async getStudentCourses() {
    const response = await fetch(`${API_BASE_URL}/student/courses`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async getStudentGradesForCourse(courseId) {
    const response = await fetch(`${API_BASE_URL}/student/courses/${courseId}/grades`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async getAllStudentGrades() {
    const response = await fetch(`${API_BASE_URL}/student/grades`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Student management endpoints (for teachers)
  async getAllStudents(search, courseId) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (courseId) params.append('courseId', courseId);
    
    const url = `${API_BASE_URL}/teacher/students${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async enrollStudentsToCourse(courseId, studentIds) {
    const response = await fetch(`${API_BASE_URL}/teacher/courses/${courseId}/enroll-students`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ studentIds })
    });
    return handleResponse(response);
  },

  async unenrollStudentFromCourse(courseId, studentId) {
    const response = await fetch(`${API_BASE_URL}/teacher/courses/${courseId}/students/${studentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

export default api;

