// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getNotifications = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get('/likecomment/notifications', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting notifications:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const token = localStorage.getItem('token');
    await api.put(`/likecomment/notifications/${notificationId}/read`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const token = localStorage.getItem('token');
    await api.put('/likecomment/notifications/read-all', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};
export default api;
