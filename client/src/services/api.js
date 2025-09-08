import axios from 'axios';

const API_BASE_URL = "https://eventx-studio-update-production.up.railway.app/api" ;


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Events API
export const eventsAPI = {
  getEvents: (params) => api.get('/events', { params }),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (eventData) => api.post('/events', eventData),
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/events/${id}`),
};

// Tickets API
export const ticketsAPI = {
  bookTicket: (ticketData) => api.post('/tickets/book', ticketData),
  getMyTickets: () => api.get('/tickets/my-tickets'),
  getTicket: (id) => api.get(`/tickets/${id}`),
  checkInTicket: (id) => api.put(`/tickets/${id}/check-in`),
  cancelTicket: (id) => api.delete(`/tickets/${id}`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getEvents: (params) => api.get('/admin/events', { params }),
  getTickets: (params) => api.get('/admin/tickets', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createEvent: (eventData) => api.post('/admin/events', eventData),
  updateEvent: (id, eventData) => api.put(`/admin/events/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),
  checkInTicket: (ticketId) => api.put(`/admin/tickets/${ticketId}/check-in`),
};

export default api;



