// js/email-service.js
// Email Service with EmailJS Integration

import { fetchWeatherData, getAIWeatherTip, formatWeatherDisplay, getWeatherEmoji } from './weather-service.js';

// EmailJS Configuration
const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_q9mploa',
    TEMPLATE_ID: 'weather_reminder',
    PUBLIC_KEY: '' // User needs to add this from EmailJS dashboard
};

/**
 * Initialize EmailJS
 */
export function initEmailJS(publicKey) {
    if (!publicKey) {
        console.warn('⚠️ EmailJS public key not provided');
        return false;
    }
    
    EMAILJS_CONFIG.PUBLIC_KEY = publicKey;
    
    if (typeof emailjs !== 'undefined') {
        emailjs.init(publicKey);
        console.log('✅ EmailJS initialized');
        return true;
    } else {
        console.error('❌ EmailJS library not loaded');
        return false;
    }
}

/**
 * Format schedule list for email
 */
function formatScheduleHTML(schedules) {
    if (!schedules || schedules.length === 0) {
        return `
            <div class="schedule-card">
                <p style="text-align: center; color: #999;">
                    📝 Hôm nay không có lịch học nào
                </p>
            </div>
        `;
    }

    return schedules.map(schedule => `
        <div class="schedule-card">
            <div class="schedule-time">
                ⏰ ${schedule.start_time} - ${schedule.end_time}
            </div>
            <div class="schedule-info">
                <strong>📚 Môn học:</strong> ${schedule.subject}
            </div>
            <div class="schedule-info">
                <strong>👨‍🏫 Giảng viên:</strong> ${schedule.teacher || 'Chưa có thông tin'}
            </div>
            <div class="schedule-info">
                <strong>📍 Phòng:</strong> ${schedule.room || 'Chưa có thông tin'}
            </div>
            <div class="schedule-info">
                <strong>🏢 Cơ sở:</strong> ${schedule.location || 'Chưa có thông tin'}
            </div>
        </div>
    `).join('');
}

/**
 * Send schedule & weather email
 */
export async function sendScheduleWeatherEmail(recipientEmail, schedules = []) {
    const startTime = Date.now();
    
    if (!EMAILJS_CONFIG.PUBLIC_KEY) {
        const error = 'EmailJS not initialized. Please set PUBLIC_KEY first.';
        console.error('❌', error);
        
        if (window.adminLogger) {
            await window.adminLogger.logError('EMAIL_FAILURE', error, {
                source: 'sendScheduleWeatherEmail',
                user_affected: 'quynh',
                severity: 'HIGH'
            });
        }
        
        return { success: false, error };
    }

    try {
        // 1. Fetch weather
        console.log('📡 Fetching weather data...');
        let weatherData;
        try {
            weatherData = await fetchWeatherData();
        } catch (error) {
            console.error('Weather fetch failed, using default');
            weatherData = getDefaultWeatherData();
        }

        // 2. Get AI analysis
        console.log('🤖 Getting AI weather analysis...');
        let aiAdvice;
        try {
            aiAdvice = await getAIWeatherTip(weatherData, schedules);
        } catch (error) {
            console.error('AI analysis failed, using fallback');
            aiAdvice = 'Hôm nay hãy chú ý thời tiết và giữ gìn sức khỏe nhé! Chúc em học tốt! 💕';
        }

        // 3. Format date
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // 4. Format weather display
        const weather = formatWeatherDisplay(weatherData);

        // 5. Prepare email template parameters
        const templateParams = {
            to_email: recipientEmail,
            schedule_date: dateStr,
            weather_temp: weather.temp,
            weather_description: weather.description,
            weather_emoji: weather.emoji,
            weather_humidity: weather.humidity,
            weather_feels_like: weather.feelsLike,
            weather_wind_speed: weather.windSpeed,
            weather_visibility: weather.visibility,
            ai_weather_advice: aiAdvice,
            schedule_list: formatScheduleHTML(schedules)
        };

        console.log('📧 Sending email...', templateParams);

        // 6. Send email via EmailJS
        const result = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            templateParams,
            EMAILJS_CONFIG.PUBLIC_KEY
        );

        const duration = Date.now() - startTime;
        console.log(`✅ Email sent successfully in ${duration}ms`, result);
        
        // Log success
        if (window.adminLogger) {
            await window.adminLogger.logError('EMAIL_SUCCESS', 'Email sent successfully', {
                source: 'sendScheduleWeatherEmail',
                user_affected: 'quynh',
                recipient_email: recipientEmail,
                schedule_count: schedules.length,
                duration_ms: duration,
                severity: 'INFO'
            });
        }

        return { 
            success: true, 
            duration,
            result 
        };

    } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error.message || 'Unknown email error';
        
        console.error('❌ Email Send Error:', errorMessage, error);

        // Log error
        if (window.adminLogger) {
            await window.adminLogger.logError('EMAIL_FAILURE', errorMessage, {
                source: 'sendScheduleWeatherEmail',
                user_affected: 'quynh',
                recipient_email: recipientEmail,
                schedule_count: schedules ? schedules.length : 0,
                duration_ms: duration,
                fallback_used: false,
                stack_trace: error.stack
            });
        }

        return { 
            success: false, 
            error: errorMessage,
            duration 
        };
    }
}

/**
 * Send test email
 */
export async function sendTestEmail(recipientEmail) {
    const testSchedules = [
        {
            start_time: '07:00',
            end_time: '09:00',
            subject: 'Toán Cao Cấp',
            teacher: 'TS. Nguyễn Văn A',
            room: 'A101',
            location: 'Cơ sở 1'
        },
        {
            start_time: '09:30',
            end_time: '11:30',
            subject: 'Lập Trình Web',
            teacher: 'ThS. Trần Thị B',
            room: 'B205',
            location: 'Cơ sở 1'
        }
    ];

    return await sendScheduleWeatherEmail(recipientEmail, testSchedules);
}

/**
 * Schedule daily email at specific time
 */
export function scheduleDailyEmail(recipientEmail, scheduleGetter, hour = 6, minute = 0) {
    function scheduleNext() {
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hour, minute, 0, 0);

        // If time has passed today, schedule for tomorrow
        if (now > scheduledTime) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const timeUntilEmail = scheduledTime - now;
        const hoursUntil = Math.floor(timeUntilEmail / (1000 * 60 * 60));
        const minutesUntil = Math.floor((timeUntilEmail % (1000 * 60 * 60)) / (1000 * 60));

        console.log(`⏰ Next email scheduled in ${hoursUntil}h ${minutesUntil}m at ${scheduledTime.toLocaleString('vi-VN')}`);

        setTimeout(async () => {
            console.log('📧 Sending scheduled daily email...');
            
            // Get today's schedules
            const todaySchedules = scheduleGetter ? scheduleGetter() : [];
            
            // Send email
            await sendScheduleWeatherEmail(recipientEmail, todaySchedules);
            
            // Schedule for next day
            scheduleNext();
        }, timeUntilEmail);
    }

    scheduleNext();
    console.log(`✅ Daily email scheduled for ${hour}:${minute.toString().padStart(2, '0')}`);
}

/**
 * Get default weather data
 */
function getDefaultWeatherData() {
    return {
        weather: [
            { 
                main: 'Clear', 
                description: 'Trời nắng', 
                icon: '01d' 
            }
        ],
        main: {
            temp: 28,
            feels_like: 30,
            humidity: 70,
            pressure: 1013
        },
        wind: {
            speed: 3.5
        },
        visibility: 10000
    };
}

/**
 * Send DAILY WEATHER email (NO schedule)
 * This is for the 6 AM daily reminder
 */
export async function sendDailyWeatherEmail(recipientEmail) {
    const startTime = Date.now();
    
    if (!EMAILJS_CONFIG.PUBLIC_KEY) {
        const error = 'EmailJS not initialized. Please set PUBLIC_KEY first.';
        console.error('❌', error);
        
        if (window.adminLogger) {
            await window.adminLogger.logError('EMAIL_FAILURE', error, {
                source: 'sendDailyWeatherEmail',
                user_affected: 'all',
                severity: 'HIGH'
            });
        }
        
        return { success: false, error };
    }

    try {
        // 1. Fetch weather
        console.log('📡 Fetching weather data...');
        let weatherData;
        try {
            weatherData = await fetchWeatherData();
        } catch (error) {
            console.error('Weather fetch failed, using default');
            weatherData = getDefaultWeatherData();
        }

        // 2. Get AI analysis (without schedule context)
        console.log('🤖 Getting AI weather analysis...');
        let aiAdvice;
        try {
            aiAdvice = await getAIWeatherTip(weatherData, []); // Empty array = no schedule
        } catch (error) {
            console.error('AI analysis failed, using fallback');
            aiAdvice = 'Hôm nay hãy chú ý thời tiết và giữ gìn sức khỏe nhé! Chúc em học tốt! 💕';
        }

        // 3. Format date
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // 4. Format weather display
        const weather = formatWeatherDisplay(weatherData);

        // 5. Prepare email template parameters (NO schedule_list)
        const templateParams = {
            to_email: recipientEmail,
            schedule_date: dateStr,
            weather_temp: weather.temp,
            weather_description: weather.description,
            weather_emoji: weather.emoji,
            weather_humidity: weather.humidity,
            weather_feels_like: weather.feelsLike,
            weather_wind_speed: weather.windSpeed,
            weather_visibility: weather.visibility,
            ai_weather_advice: aiAdvice,
            schedule_list: '', // Empty - no schedule
            has_schedule: 'false' // String 'false' for EmailJS
        };

        console.log('📧 Sending daily weather email...', templateParams);

        // 6. Send email via EmailJS
        const result = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            templateParams,
            EMAILJS_CONFIG.PUBLIC_KEY
        );

        const duration = Date.now() - startTime;
        console.log(`✅ Daily weather email sent successfully in ${duration}ms`, result);
        
        // Log success
        if (window.adminLogger) {
            await window.adminLogger.logError('EMAIL_SUCCESS', 'Daily weather email sent', {
                source: 'sendDailyWeatherEmail',
                recipient_email: recipientEmail,
                email_type: 'daily_weather',
                duration_ms: duration,
                severity: 'INFO'
            });
        }

        return { 
            success: true, 
            duration,
            result 
        };

    } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error.message || 'Unknown email error';
        
        console.error('❌ Email Send Error:', errorMessage, error);

        // Log error
        if (window.adminLogger) {
            await window.adminLogger.logError('EMAIL_FAILURE', errorMessage, {
                source: 'sendDailyWeatherEmail',
                recipient_email: recipientEmail,
                email_type: 'daily_weather',
                duration_ms: duration,
                stack_trace: error.stack
            });
        }

        return { 
            success: false, 
            error: errorMessage,
            duration 
        };
    }
}

/**
 * Schedule daily weather email at 6 AM
 * Automatically sends to all active recipients in Firebase
 */
export function scheduleDailyWeatherEmail(hour = 6, minute = 0) {
    function scheduleNext() {
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hour, minute, 0, 0);

        // If time has passed today, schedule for tomorrow
        if (now > scheduledTime) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const timeUntilEmail = scheduledTime - now;
        const hoursUntil = Math.floor(timeUntilEmail / (1000 * 60 * 60));
        const minutesUntil = Math.floor((timeUntilEmail % (1000 * 60 * 60)) / (1000 * 60));

        console.log(`⏰ Next daily weather email scheduled in ${hoursUntil}h ${minutesUntil}m at ${scheduledTime.toLocaleString('vi-VN')}`);

        setTimeout(async () => {
            console.log('📧 Sending scheduled daily weather email (6 AM)...');
            
            // Get all active recipients from Firebase
            const { getRecipients, updateRecipient } = await import('./data/database.js');
            const recipients = await getRecipients();
            
            // Send to all active recipients
            for (const [id, data] of Object.entries(recipients)) {
                if (data.active) {
                    console.log(`📧 Sending to ${data.email}...`);
                    const result = await sendDailyWeatherEmail(data.email);
                    
                    if (result.success) {
                        // Update lastSent timestamp
                        await updateRecipient(id, { lastSent: Date.now() });
                    }
                }
            }
            
            // Schedule for next day
            scheduleNext();
        }, timeUntilEmail);
    }

    scheduleNext();
    console.log(`✅ Daily weather email scheduled for ${hour}:${minute.toString().padStart(2, '0')}`);
}

