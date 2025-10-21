# 📧 EmailJS Setup Guide - UniSchedule Weather System

## 🎯 Tổng Quan

Hướng dẫn chi tiết để setup EmailJS cho hệ thống gửi email thời tiết tự động.

---

## 📋 Bước 1: Tạo Tài Khoản EmailJS

1. Truy cập: **https://www.emailjs.com/**
2. Click **Sign Up** (miễn phí)
3. Đăng ký bằng email hoặc Google
4. Xác nhận email

---

## 🔧 Bước 2: Tạo Email Service

1. Vào Dashboard: https://dashboard.emailjs.com/admin
2. Click **Add New Service**
3. Chọn email provider (Gmail khuyến nghị)
4. Follow hướng dẫn kết nối Gmail:
   - Allow EmailJS access to Gmail
   - Verify connection
5. **Lưu Service ID**: `service_q9mploa` (bạn đã có rồi! ✅)

---

## 📝 Bước 3: Tạo Email Template

### 3.1. Tạo Template Mới

1. Vào: https://dashboard.emailjs.com/admin/templates
2. Click **Create New Template**
3. **Template Name**: `Weather Reminder`
4. **Template ID**: `weather_reminder`

### 3.2. Email Subject

```
🌤️ Lịch học hôm nay - {{schedule_date}} | Dự báo thời tiết Đà Nẵng
```

### 3.3. Email Content (HTML)

Paste toàn bộ HTML sau vào phần **Content**:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Arial', 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #ffeef2 0%, #fff0f6 100%);
            margin: 0;
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(255, 107, 157, 0.15);
        }
        .email-header {
            background: linear-gradient(135deg, #ff6b9d 0%, #8e44ad 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }
        .email-header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
        }
        .email-header p {
            margin: 10px 0 0 0;
            font-size: 14px;
            opacity: 0.95;
        }
        .email-body {
            padding: 30px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #ff6b9d;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .weather-card {
            background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 5px solid #007aff;
        }
        .weather-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .weather-temp {
            font-size: 36px;
            font-weight: 800;
            color: #007aff;
        }
        .weather-desc {
            font-size: 16px;
            color: #4a4a4a;
            font-weight: 600;
        }
        .weather-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 15px;
        }
        .weather-detail-item {
            background: rgba(255, 255, 255, 0.7);
            padding: 10px;
            border-radius: 10px;
            font-size: 14px;
        }
        .ai-advice {
            background: linear-gradient(135deg, #fff0f6 0%, #ffe5ec 100%);
            border-radius: 15px;
            padding: 20px;
            border-left: 5px solid #ff6b9d;
            margin-bottom: 20px;
        }
        .ai-advice-text {
            font-size: 15px;
            line-height: 1.8;
            color: #4a4a4a;
            white-space: pre-line;
        }
        .schedule-card {
            background: linear-gradient(135deg, #ffeef2 0%, #fff0f6 100%);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 5px solid #ff6b9d;
        }
        .schedule-time {
            font-size: 18px;
            font-weight: 700;
            color: #ff6b9d;
            margin-bottom: 10px;
        }
        .schedule-info {
            font-size: 14px;
            color: #4a4a4a;
            margin: 5px 0;
        }
        .schedule-info strong {
            color: #ff6b9d;
        }
        .reminder-note {
            background: linear-gradient(135deg, #ffab73 0%, #ff6b9d 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 15px;
            text-align: center;
            font-size: 16px;
            font-weight: 600;
            margin-top: 20px;
        }
        .email-footer {
            background: #f8f8f8;
            padding: 20px;
            text-align: center;
            border-top: 3px solid #ff6b9d;
        }
        .email-footer p {
            margin: 5px 0;
            font-size: 14px;
            color: #666;
        }
        .emoji {
            font-size: 24px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <h1>🌤️ Lịch Học & Thời Tiết Hôm Nay</h1>
            <p>{{schedule_date}}</p>
        </div>

        <!-- Body -->
        <div class="email-body">
            <!-- Weather Section -->
            <div class="section">
                <div class="section-title">
                    <span class="emoji">🌤️</span>
                    <span>Dự Báo Thời Tiết Đà Nẵng</span>
                </div>
                
                <div class="weather-card">
                    <div class="weather-info">
                        <div>
                            <div class="weather-temp">{{weather_temp}}°C</div>
                            <div class="weather-desc">{{weather_description}}</div>
                        </div>
                        <div class="emoji" style="font-size: 48px;">{{weather_emoji}}</div>
                    </div>
                    
                    <div class="weather-details">
                        <div class="weather-detail-item">
                            <strong>💧 Độ ẩm:</strong> {{weather_humidity}}%
                        </div>
                        <div class="weather-detail-item">
                            <strong>🌡️ Cảm giác:</strong> {{weather_feels_like}}°C
                        </div>
                        <div class="weather-detail-item">
                            <strong>💨 Gió:</strong> {{weather_wind_speed}} m/s
                        </div>
                        <div class="weather-detail-item">
                            <strong>👁️ Tầm nhìn:</strong> {{weather_visibility}} km
                        </div>
                    </div>
                </div>

                <!-- AI Weather Advice -->
                <div class="ai-advice">
                    <div class="section-title" style="margin-bottom: 10px;">
                        <span class="emoji">🤖</span>
                        <span>Lời Khuyên Từ AI</span>
                    </div>
                    <div class="ai-advice-text">{{ai_weather_advice}}</div>
                </div>
            </div>

            <!-- Schedule Section -->
            <div class="section">
                <div class="section-title">
                    <span class="emoji">📅</span>
                    <span>Lịch Học Hôm Nay</span>
                </div>

                {{schedule_list}}
            </div>

            <!-- Reminder Note -->
            <div class="reminder-note">
                💕 Chúc em học tốt và giữ gìn sức khỏe nhé! 💕
            </div>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <p><strong>UniSchedule</strong> - Hệ thống quản lý lịch thông minh</p>
            <p>📧 Email này được gửi tự động từ UniSchedule</p>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">
                Powered by OpenWeather API & Google Gemini AI
            </p>
        </div>
    </div>
</body>
</html>
```

### 3.4. Template Settings

Trong phần **Settings**, thêm các biến sau (để test):

```json
{
  "schedule_date": "Thứ Hai, 21/10/2024",
  "weather_temp": "28",
  "weather_description": "Trời nắng nhẹ",
  "weather_emoji": "☀️",
  "weather_humidity": "75",
  "weather_feels_like": "30",
  "weather_wind_speed": "4.2",
  "weather_visibility": "10",
  "ai_weather_advice": "Hôm nay thời tiết Đà Nẵng khá nóng với nhiệt độ 28°C ☀️ Em nhớ mang theo nước uống và đội mũ/áo khoác khi ra ngoài nhé. Hãy bổ sung nước thường xuyên để tránh mất nước. Chúc em học tốt! 💕",
  "schedule_list": "<div class='schedule-card'><div class='schedule-time'>⏰ 07:00 - 09:00</div><div class='schedule-info'><strong>📚 Môn học:</strong> Toán Cao Cấp</div><div class='schedule-info'><strong>👨‍🏫 Giảng viên:</strong> TS. Nguyễn Văn A</div><div class='schedule-info'><strong>📍 Phòng:</strong> A101</div><div class='schedule-info'><strong>🏢 Cơ sở:</strong> Cơ sở 1</div></div>"
}
```

---

## 🔑 Bước 4: Lấy Public Key

1. Vào: https://dashboard.emailjs.com/admin/account
2. Tìm phần **General** → **Public Key**
3. Copy Public Key (dạng: `user_xxxxxxxxxxxxxxxxx`)
4. Paste vào ô **"EmailJS Public Key"** trong Weather Admin Dashboard

---

## ✅ Bước 5: Test Email

1. Vào Weather Admin Dashboard: `weather-admin.html?user=tuan`
2. Nhập email người nhận
3. Nhập EmailJS Public Key (đã copy ở bước 4)
4. Click **"📧 Gửi Email Test"**
5. Check inbox (và spam folder) để xem email

---

## 🎯 Cách Sử Dụng Trong Code

### Import modules:
```javascript
import { initEmailJS, sendScheduleWeatherEmail } from './js/email-service.js';
```

### Initialize EmailJS:
```javascript
initEmailJS('YOUR_PUBLIC_KEY_HERE');
```

### Gửi email:
```javascript
const schedules = [
    {
        start_time: '07:00',
        end_time: '09:00',
        subject: 'Toán Cao Cấp',
        teacher: 'TS. Nguyễn Văn A',
        room: 'A101',
        location: 'Cơ sở 1'
    }
];

const result = await sendScheduleWeatherEmail('quynh@example.com', schedules);

if (result.success) {
    console.log('✅ Email sent!');
} else {
    console.error('❌ Error:', result.error);
}
```

---

## 🔥 API Keys Đang Có

### OpenWeather API
- **API Key**: `4d10eed7e65a8444dcf7eb1fda3ea36f`
- **City**: Da Nang
- **Limit**: 1000 calls/day (miễn phí)

### Google Gemini AI
- **API Key**: `AIzaSyCFuNJ0RYORLNATGP3GGcxi8T-xZweDPfY`
- **Model**: gemini-pro
- **Limit**: 60 requests/minute (miễn phí)

### EmailJS
- **Service ID**: `service_q9mploa` ✅
- **Template ID**: `weather_reminder` (cần tạo)
- **Public Key**: (cần lấy từ dashboard)

---

## 🐛 Troubleshooting

### Email không gửi được:
1. ✅ Check Service ID đúng chưa
2. ✅ Check Template ID đúng chưa  
3. ✅ Check Public Key đúng chưa
4. ✅ Check Gmail connection còn hoạt động không
5. ✅ Check console log có lỗi gì không

### AI không phân tích:
1. ✅ Check Gemini API key
2. ✅ Check có block request không (CORS, firewall)
3. ✅ Check quota limit (60 req/min)

### Weather không load:
1. ✅ Check OpenWeather API key
2. ✅ Check city name đúng chưa (Da Nang)
3. ✅ Check quota limit (1000 calls/day)

---

## 📚 Tài Liệu Tham Khảo

- **EmailJS Docs**: https://www.emailjs.com/docs/
- **OpenWeather API**: https://openweathermap.org/api
- **Google Gemini AI**: https://ai.google.dev/

---

## 🎉 Hoàn Thành!

Sau khi setup xong, hệ thống sẽ:
1. ✅ Tự động lấy thời tiết Đà Nẵng
2. ✅ AI phân tích và đưa lời khuyên
3. ✅ Gửi email thông báo cho Quỳnh
4. ✅ Log lỗi tự động nếu có vấn đề
5. ✅ Thông báo cho Tuân qua dashboard

**Chúc mừng! 🎊**

