// js/weather-service.js
// Weather API Service with AI Integration

// Configuration
const WEATHER_CONFIG = {
    API_KEY: '4d10eed7e65a8444dcf7eb1fda3ea36f',
    CITY: 'Da Nang',
    API_URL: 'https://api.openweathermap.org/data/2.5/weather',
    CACHE_TTL: 30 * 60 * 1000, // 30 minutes
};

const GEMINI_CONFIG = {
    API_KEY: 'AIzaSyCFuNJ0RYORLNATGP3GGcxi8T-xZweDPfY',
    MODEL: 'gemini-2.0-flash-exp', // Using latest experimental model (free)
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
    TIMEOUT: 10000, // 10 seconds
    ENABLED: true, // Set to false to disable AI and use fallback only
};

// Weather cache
let weatherCache = {
    data: null,
    timestamp: null,
    aiTip: null,
    aiTimestamp: null
};

/**
 * Fetch weather data from OpenWeather API
 */
export async function fetchWeatherData() {
    const startTime = Date.now();
    
    // Check cache
    if (weatherCache.data && 
        weatherCache.timestamp && 
        (Date.now() - weatherCache.timestamp) < WEATHER_CONFIG.CACHE_TTL) {
        console.log('✅ Using cached weather data');
        return weatherCache.data;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const url = `${WEATHER_CONFIG.API_URL}?q=${WEATHER_CONFIG.CITY}&appid=${WEATHER_CONFIG.API_KEY}&units=metric&lang=vi`;
        
        const response = await fetch(url, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Weather API Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const duration = Date.now() - startTime;
        
        console.log(`✅ Weather data fetched in ${duration}ms`);
        
        // Update cache
        weatherCache.data = data;
        weatherCache.timestamp = Date.now();
        
        return data;

    } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error.name === 'AbortError' 
            ? `Weather API timeout after ${duration}ms`
            : error.message;
        
        console.error('❌ Weather API Error:', errorMessage);

        // Log error to admin
        if (window.adminLogger) {
            await window.adminLogger.logError('WEATHER_API_FAILURE', errorMessage, {
                source: 'fetchWeatherData',
                user_affected: 'quynh',
                duration_ms: duration,
                api_url: WEATHER_CONFIG.API_URL,
                fallback_used: true,
                stack_trace: error.stack
            });
        }

        // Use cached data if available, otherwise default
        if (weatherCache.data) {
            console.log('🔄 Using stale cached weather data');
            return weatherCache.data;
        }

        return getDefaultWeatherData();
    }
}

/**
 * Get AI weather tip from Gemini
 */
export async function getAIWeatherTip(weatherData, schedules = []) {
    const startTime = Date.now();
    
    // Check if AI is disabled
    if (!GEMINI_CONFIG.ENABLED) {
        console.log('⚠️ AI is disabled, using fallback tip');
        const fallbackTip = getSimpleWeatherTip(weatherData.weather[0].main);
        return fallbackTip;
    }
    
    // Check cache (1 hour)
    if (weatherCache.aiTip && 
        weatherCache.aiTimestamp && 
        (Date.now() - weatherCache.aiTimestamp) < 60 * 60 * 1000) {
        console.log('✅ Using cached AI tip');
        return weatherCache.aiTip;
    }

    // Build schedule context
    let scheduleContext = '';
    if (schedules && schedules.length > 0) {
        const nextClass = schedules[0];
        scheduleContext = `\nEm có lịch học lúc ${nextClass.start_time}: ${nextClass.subject}`;
    }

    const prompt = `
Bạn là trợ lý AI thông minh của UniSchedule. Hãy phân tích thời tiết và đưa ra lời khuyên cho học sinh.

📊 THỜI TIẾT ĐÀ NẴNG:
- Tình trạng: ${weatherData.weather[0].main} (${weatherData.weather[0].description})
- Nhiệt độ: ${Math.round(weatherData.main.temp)}°C (Cảm giác: ${Math.round(weatherData.main.feels_like)}°C)
- Độ ẩm: ${weatherData.main.humidity}%
- Gió: ${weatherData.wind.speed} m/s
${scheduleContext}

🎯 YÊU CẦU:
Viết 3-4 câu ngắn gọn, thân thiết (xưng hô "em"):
1. Đánh giá thời tiết (1 câu)
2. Lời khuyên cụ thể:
   - MƯA: nhắc mang áo mưa, ô, đi cẩn thận
   - NẮNG (>30°C): nhắc mang nước, đội mũ/áo khoác
   - LẠNH (<20°C): nhắc mặc ấm
3. Chúc em học tốt (1 câu)

⚠️ Dùng emoji phù hợp, thực tế, hữu ích.

Ví dụ tốt:
"Hôm nay Đà Nẵng có mưa to và gió khá mạnh 🌧️💨 Em nhớ mang theo áo mưa và ô nhé. Đường trơn trượt nên đi cẩn thận. Chúc em học tốt và giữ gìn sức khỏe! 💕"
`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), GEMINI_CONFIG.TIMEOUT);

        const response = await fetch(
            `${GEMINI_CONFIG.API_URL}?key=${GEMINI_CONFIG.API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 300
                    }
                }),
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('❌ Gemini API Response:', errorBody);
            throw new Error(`Gemini API Error: ${response.status} - ${response.statusText}. Body: ${errorBody.substring(0, 200)}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid response structure from Gemini API');
        }

        const aiTip = data.candidates[0].content.parts[0].text.trim();
        const duration = Date.now() - startTime;
        
        console.log(`✅ AI tip generated in ${duration}ms:`, aiTip);
        
        // Update cache
        weatherCache.aiTip = aiTip;
        weatherCache.aiTimestamp = Date.now();
        
        return aiTip;

    } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error.name === 'AbortError'
            ? `Gemini API timeout after ${duration}ms`
            : error.message;
        
        console.error('❌ AI Error:', errorMessage);

        // Log error to admin
        if (window.adminLogger) {
            await window.adminLogger.logError('AI_FAILURE', errorMessage, {
                source: 'getAIWeatherTip',
                user_affected: 'quynh',
                weather_data: {
                    main: weatherData.weather[0].main,
                    temp: weatherData.main.temp,
                    description: weatherData.weather[0].description
                },
                duration_ms: duration,
                fallback_used: true,
                stack_trace: error.stack
            });
        }

        // Use fallback
        const fallbackTip = getSimpleWeatherTip(weatherData.weather[0].main);
        console.log('🔄 Using fallback tip:', fallbackTip);
        
        return fallbackTip;
    }
}

/**
 * Simple fallback weather tips
 */
function getSimpleWeatherTip(weatherMain) {
    const tips = {
        'Rain': '🌧️ Trời đang mưa! Nhớ mang ô và đi cẩn thận nhé. Đường trơn trượt, em chú ý an toàn. Chúc em học tốt! 💕',
        'Clear': '☀️ Trời nắng đẹp hôm nay! Nhớ mang theo nước uống và đội mũ/đeo kính khi ra ngoài. Bổ sung nước thường xuyên nhé. Chúc em học tốt! 💕',
        'Clouds': '☁️ Trời nhiều mây, thời tiết mát mẻ. Có thể mưa nên mang theo ô dự phòng. Chúc em một ngày học tập hiệu quả! 💕',
        'Thunderstorm': '⛈️ Có dông hôm nay! Hạn chế ra ngoài nếu không cần thiết. Nếu phải đi thì mang áo mưa và đi thật cẩn thận. Chúc em an toàn! 💕',
        'Drizzle': '🌦️ Mưa phùn nhẹ! Mang ô hoặc áo khoác có mũ. Đường có thể trơn, em đi cẩn thận nhé. Chúc em học tốt! 💕',
        'Snow': '❄️ Trời lạnh! Mặc áo ấm và cẩn thận khi di chuyển. Giữ ấm cơ thể nhé. Chúc em học tốt! 💕',
        'Mist': '🌫️ Trời sương mù! Cẩn thận khi đi đường, tầm nhìn hạn chế. Di chuyển chậm và an toàn. Chúc em học tốt! 💕',
        'Fog': '🌫️ Trời có sương mù dày! Di chuyển thật cẩn thận, tầm nhìn rất hạn chế. Chúc em an toàn! 💕'
    };
    return tips[weatherMain] || '🌤️ Chúc em có một ngày học tập tốt lành! Giữ gìn sức khỏe nhé! 💕';
}

/**
 * Get default weather data (fallback)
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
 * Get weather emoji
 */
export function getWeatherEmoji(weatherMain) {
    const emojis = {
        'Rain': '🌧️',
        'Clear': '☀️',
        'Clouds': '☁️',
        'Thunderstorm': '⛈️',
        'Drizzle': '🌦️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Fog': '🌫️'
    };
    return emojis[weatherMain] || '🌤️';
}

/**
 * Format weather data for display
 */
export function formatWeatherDisplay(weatherData) {
    return {
        temp: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        description: weatherData.weather[0].description,
        main: weatherData.weather[0].main,
        emoji: getWeatherEmoji(weatherData.weather[0].main),
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed.toFixed(1),
        visibility: (weatherData.visibility / 1000).toFixed(1),
        icon: weatherData.weather[0].icon
    };
}

