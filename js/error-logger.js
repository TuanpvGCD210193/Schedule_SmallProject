// js/error-logger.js
// Admin Error Logging System

/**
 * Error Logger Class for Admin Dashboard
 */
class AdminErrorLogger {
    constructor() {
        this.firebaseUrl = 'https://unisched-app-11368-default-rtdb.asia-southeast1.firebasedatabase.app';
        this.errorTypes = {
            AI_FAILURE: '🤖 AI Lỗi',
            AI_TIMEOUT: '⏱️ AI Timeout',
            AI_SUCCESS: '✅ AI Thành công',
            WEATHER_API_FAILURE: '🌤️ Weather API Lỗi',
            EMAIL_FAILURE: '📧 Email Lỗi',
            CALENDAR_SYNC_FAILURE: '📅 Đồng bộ Lịch Lỗi',
            DATABASE_FAILURE: '🔥 Firebase Lỗi'
        };
        
        this.enabled = true;
    }

    /**
     * Log error to Firebase
     */
    async logError(errorType, errorMessage, details = {}) {
        if (!this.enabled) {
            console.log('⚠️ Error logging disabled');
            return null;
        }

        const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const errorData = {
            timestamp: new Date().toISOString(),
            error_type: errorType,
            error_message: errorMessage,
            source: details.source || 'unknown',
            severity: this.getSeverity(errorType),
            user_affected: details.user_affected || 'quynh',
            details: details,
            is_read: false,
            auto_fallback_used: details.fallback_used || false
        };

        try {
            // Save to Firebase
            const response = await fetch(
                `${this.firebaseUrl}/users/tuan/error_notifications/${errorId}.json`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(errorData)
                }
            );

            if (response.ok) {
                console.log(`✅ Error logged: ${errorId}`, errorData);
                
                // Create in-app notification for Tuân if severity is high
                if (errorData.severity === 'HIGH' || errorData.severity === 'CRITICAL') {
                    await this.createInAppNotification(errorData);
                }
                
                return errorId;
            } else {
                throw new Error('Failed to log error to Firebase');
            }
        } catch (error) {
            console.error('❌ Failed to log error to Firebase:', error);
            // Fallback to localStorage
            this.saveErrorToLocalStorage(errorId, errorData);
            return errorId;
        }
    }

    /**
     * Get severity level
     */
    getSeverity(errorType) {
        const severityMap = {
            'AI_FAILURE': 'MEDIUM',
            'AI_TIMEOUT': 'MEDIUM',
            'AI_SUCCESS': 'INFO',
            'WEATHER_API_FAILURE': 'HIGH',
            'EMAIL_FAILURE': 'HIGH',
            'CALENDAR_SYNC_FAILURE': 'MEDIUM',
            'DATABASE_FAILURE': 'CRITICAL'
        };
        return severityMap[errorType] || 'LOW';
    }

    /**
     * Create in-app notification for Tuân
     */
    async createInAppNotification(errorData) {
        const notificationId = `notif_${Date.now()}`;
        
        const notification = {
            id: notificationId,
            title: `${this.errorTypes[errorData.error_type]} - ${errorData.severity}`,
            message: errorData.error_message,
            timestamp: errorData.timestamp,
            type: 'error',
            is_read: false,
            action_required: errorData.severity === 'CRITICAL' || errorData.severity === 'HIGH',
            details: errorData
        };

        try {
            const response = await fetch(
                `${this.firebaseUrl}/users/tuan/notifications/${notificationId}.json`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(notification)
                }
            );

            if (response.ok) {
                console.log('✅ In-app notification created for Tuân');
            }
        } catch (error) {
            console.error('❌ Failed to create notification:', error);
        }
    }

    /**
     * Fallback: Save to localStorage
     */
    saveErrorToLocalStorage(errorId, errorData) {
        try {
            const errors = JSON.parse(localStorage.getItem('admin_errors') || '[]');
            errors.push({ id: errorId, ...errorData });
            
            // Keep only last 50 errors
            if (errors.length > 50) {
                errors.splice(0, errors.length - 50);
            }
            
            localStorage.setItem('admin_errors', JSON.stringify(errors));
            console.log('📦 Error saved to localStorage');
        } catch (error) {
            console.error('❌ Failed to save to localStorage:', error);
        }
    }

    /**
     * Load errors from Firebase
     */
    async loadErrors() {
        try {
            const response = await fetch(
                `${this.firebaseUrl}/users/tuan/error_notifications.json`
            );
            
            const errors = await response.json();
            
            if (!errors) {
                return [];
            }

            return Object.entries(errors)
                .map(([id, error]) => ({ id, ...error }))
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        } catch (error) {
            console.error('Error loading errors:', error);
            return this.loadErrorsFromLocalStorage();
        }
    }

    /**
     * Load unread errors
     */
    async loadUnreadErrors() {
        const errors = await this.loadErrors();
        return errors.filter(error => !error.is_read);
    }

    /**
     * Mark error as read
     */
    async markAsRead(errorId) {
        try {
            await fetch(
                `${this.firebaseUrl}/users/tuan/error_notifications/${errorId}/is_read.json`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(true)
                }
            );
            
            console.log(`✅ Error ${errorId} marked as read`);
            return true;

        } catch (error) {
            console.error('Error marking as read:', error);
            return false;
        }
    }

    /**
     * Mark all errors as read
     */
    async markAllAsRead() {
        const errors = await this.loadUnreadErrors();
        
        const promises = errors.map(error => this.markAsRead(error.id));
        await Promise.all(promises);
        
        console.log(`✅ Marked ${errors.length} errors as read`);
    }

    /**
     * Delete error
     */
    async deleteError(errorId) {
        try {
            await fetch(
                `${this.firebaseUrl}/users/tuan/error_notifications/${errorId}.json`,
                {
                    method: 'DELETE'
                }
            );
            
            console.log(`✅ Error ${errorId} deleted`);
            return true;

        } catch (error) {
            console.error('Error deleting:', error);
            return false;
        }
    }

    /**
     * Clear all errors
     */
    async clearAllErrors() {
        try {
            await fetch(
                `${this.firebaseUrl}/users/tuan/error_notifications.json`,
                {
                    method: 'DELETE'
                }
            );
            
            console.log('✅ All errors cleared');
            return true;

        } catch (error) {
            console.error('Error clearing all:', error);
            return false;
        }
    }

    /**
     * Load errors from localStorage
     */
    loadErrorsFromLocalStorage() {
        try {
            const errors = JSON.parse(localStorage.getItem('admin_errors') || '[]');
            return errors;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return [];
        }
    }

    /**
     * Get error statistics
     */
    async getStatistics() {
        const errors = await this.loadErrors();
        
        const stats = {
            total: errors.length,
            unread: errors.filter(e => !e.is_read).length,
            by_type: {},
            by_severity: {},
            last_24h: 0
        };

        const last24h = Date.now() - (24 * 60 * 60 * 1000);

        errors.forEach(error => {
            // By type
            stats.by_type[error.error_type] = (stats.by_type[error.error_type] || 0) + 1;
            
            // By severity
            stats.by_severity[error.severity] = (stats.by_severity[error.severity] || 0) + 1;
            
            // Last 24h
            if (new Date(error.timestamp).getTime() > last24h) {
                stats.last_24h++;
            }
        });

        return stats;
    }
}

// Initialize and export global error logger
const adminLogger = new AdminErrorLogger();

// Make it available globally
if (typeof window !== 'undefined') {
    window.adminLogger = adminLogger;
}

export default adminLogger;

