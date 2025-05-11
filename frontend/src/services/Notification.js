import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from './api';

const API_URL = 'http://localhost:8080/api/notifications'; // Replace with your actual API URL

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const Notification = {
    // Notification-related functions
    getNotifications: async () => {
        try {
            return await getNotifications();
        } catch (error) {
            throw new Error(error.message || 'Failed to get notifications');
        }
    },

    getUnreadNotifications: async () => {
        try {
            return await getUnreadNotifications();
        } catch (error) {
            throw new Error(error.message || 'Failed to get unread notifications');
        }
    },

    markNotificationAsRead: async (notificationId) => {
        try {
            return await markNotificationAsRead(notificationId);
        } catch (error) {
            throw new Error(error.message || 'Failed to mark notification as read');
        }
    },

    markAllNotificationsAsRead: async () => {
        try {
            return await markAllNotificationsAsRead();
        } catch (error) {
            throw new Error(error.message || 'Failed to mark all notifications as read');
        }
    }
}; 