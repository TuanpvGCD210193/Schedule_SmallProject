# 🌤️ UniSchedule Weather & AI System

## 📋 Tổng Quan

Hệ thống tích hợp hoàn chỉnh bao gồm:
- **Weather API** (OpenWeather) - Thời tiết real-time Đà Nẵng
- **AI Analysis** (Google Gemini) - Phân tích thông minh & lời khuyên
- **Email Service** (EmailJS) - Gửi email tự động
- **Error Tracking** - Hệ thống log lỗi cho admin

---

## 🎯 Chức Năng Chính

### 1. **Weather Service** (`js/weather-service.js`)
- ✅ Fetch thời tiết Đà Nẵng từ OpenWeather API
- ✅ AI phân tích thời tiết bằng Google Gemini
- ✅ Cache thông minh (30 phút weather, 1 giờ AI)
- ✅ Fallback tự động khi API lỗi
- ✅ Format data cho display

### 2. **Error Logger** (`js/error-logger.js`)
- ✅ Log tất cả lỗi lên Firebase
- ✅ Phân loại severity (CRITICAL, HIGH, MEDIUM, LOW, INFO)
- ✅ Thông báo real-time cho admin (Tuân)
- ✅ Fallback localStorage khi Firebase lỗi
- ✅ Statistics & analytics

### 3. **Email Service** (`js/email-service.js`)
- ✅ Gửi email thông báo lịch học + thời tiết
- ✅ Tích hợp AI analysis vào email
- ✅ Schedule gửi email tự động (6h sáng)
- ✅ Test email function
- ✅ Email history tracking

### 4. **Admin Dashboard** (`tuan-functions.html`)
- ✅ Error notification badge (real-time)
- ✅ Error modal với statistics
- ✅ Weather & Email control panel
- ✅ Auto-refresh every 30 seconds

### 5. **Weather Admin** (`weather-admin.html`)
- ✅ Full weather dashboard
- ✅ AI analysis box
- ✅ Test email function
- ✅ EmailJS configuration UI

### 6. **Weather Widget** (`quynh-functions.html`)
- ✅ Mini weather display cho Quỳnh
- ✅ AI tip ngắn gọn
- ✅ Refresh button
- ✅ Auto-load on page

---

## 🔧 Cài Đặt & Cấu Hình

### Bước 1: API Keys

Tất cả API keys đã được cấu hình sẵn:

```javascript
// Weather API (OpenWeather)
API_KEY: '4d10eed7e65a8444dcf7eb1fda3ea36f'
CITY: 'Da Nang'
LIMIT: 1000 calls/day

// AI (Google Gemini)
API_KEY: 'AIzaSyCFuNJ0RYORLNATGP3GGcxi8T-xZweDPfY'
MODEL: 'gemini-pro'
LIMIT: 60 requests/minute

// Email (EmailJS)
SERVICE_ID: 'service_q9mploa'
TEMPLATE_ID: 'weather_reminder' (cần setup)
PUBLIC_KEY: (cần lấy từ dashboard)
```

### Bước 2: EmailJS Setup

Xem hướng dẫn chi tiết trong: **`EMAILJS_SETUP.md`**

Tóm tắt:
1. Tạo tài khoản EmailJS
2. Setup Gmail service
3. Create email template
4. Get Public Key
5. Test email

### Bước 3: Firebase

Cấu trúc Firebase:

```
users/
  ├─ quynh/
  │   ├─ events/          (Lịch học)
  │   ├─ notes/           (Ghi chú)
  │   ├─ water_tracking/  (Uống nước)
  │   └─ reminder_times/  (Thời gian nhắc nhở)
  │
  └─ tuan/
      ├─ error_notifications/  (Log lỗi hệ thống)
      └─ notifications/        (Thông báo real-time)
```

---

## 🚀 Cách Sử Dụng

### Cho Quỳnh (User):

1. **Xem thời tiết**: Vào `quynh-functions.html`
   - Weather widget tự động hiển thị
   - AI tip ngắn gọn
   - Click 🔄 để refresh

2. **Nhận email**: Tự động mỗi sáng 6h
   - Thời tiết Đà Nẵng
   - AI phân tích & lời khuyên
   - Lịch học trong ngày

### Cho Tuân (Admin):

1. **Xem lỗi hệ thống**: Vào `tuan-functions.html`
   - Badge 🚨 hiện số lỗi chưa đọc
   - Click để xem chi tiết
   - Mark as read / Delete errors

2. **Quản lý thời tiết**: Vào `weather-admin.html`
   - Xem thời tiết real-time
   - Phân tích bằng AI
   - Test gửi email
   - Configure EmailJS

3. **Gửi email thủ công**:
   ```javascript
   // Trong weather-admin.html
   1. Nhập email người nhận
   2. Nhập EmailJS Public Key
   3. Click "Gửi Email Test"
   ```

---

## 📊 Flow Hoạt Động

### 1. Email Tự Động (6h sáng)

```
┌──────────────────────────────────────────────┐
│  6:00 AM - Trigger Schedule                  │
└─────────────┬────────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────────┐
│  Fetch Weather Data (OpenWeather API)        │
│  - Nhiệt độ, độ ẩm, gió, tầm nhìn            │
└─────────────┬────────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────────┐
│  AI Analysis (Google Gemini)                 │
│  - Phân tích thời tiết                        │
│  - Đưa ra lời khuyên (mưa/nắng/lạnh)         │
└─────────────┬────────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────────┐
│  Get Calendar Events (Firebase)              │
│  - Lấy lịch học hôm nay của Quỳnh            │
└─────────────┬────────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────────┐
│  Format Email Content                        │
│  - Thời tiết + AI + Lịch học                 │
└─────────────┬────────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────────┐
│  Send Email (EmailJS)                        │
│  - Gửi đến email Quỳnh                        │
└─────────────┬────────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────────┐
│  Log Result (Firebase)                       │
│  - Success → INFO log                         │
│  - Failure → ERROR log + notify Tuân         │
└──────────────────────────────────────────────┘
```

### 2. Error Tracking Flow

```
┌──────────────────────────────────────────────┐
│  Error Occurs (Weather/AI/Email/etc)         │
└─────────────┬────────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────────┐
│  adminLogger.logError()                      │
│  - Type, Message, Details                    │
│  - Severity, Source, Timestamp               │
└─────────────┬────────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────────┐
│  Save to Firebase                            │
│  users/tuan/error_notifications/{id}         │
└─────────────┬────────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────────┐
│  Create In-App Notification (if HIGH/CRITICAL)│
│  users/tuan/notifications/{id}               │
└─────────────┬────────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────────┐
│  Update Badge on tuan-functions.html         │
│  🚨 [count] Lỗi                              │
└─────────────┬────────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────────┐
│  Tuân Click Badge → Open Modal               │
│  - View error details                        │
│  - Mark as read                               │
│  - Delete error                               │
└──────────────────────────────────────────────┘
```

---

## 🐛 Xử Lý Lỗi

### Các loại lỗi được track:

1. **AI_FAILURE** - Gemini API lỗi
   - Severity: MEDIUM
   - Fallback: Simple weather tip
   - Notify: Tuân (in-app)

2. **WEATHER_API_FAILURE** - OpenWeather lỗi
   - Severity: HIGH
   - Fallback: Cached data hoặc default
   - Notify: Tuân (in-app + badge)

3. **EMAIL_FAILURE** - EmailJS lỗi
   - Severity: HIGH
   - Fallback: None (just log)
   - Notify: Tuân (in-app + badge)

4. **DATABASE_FAILURE** - Firebase lỗi
   - Severity: CRITICAL
   - Fallback: localStorage
   - Notify: Tuân (in-app + badge + urgent)

### Auto-fallback system:

```javascript
// Weather Service
try {
    weather = await fetchWeatherData();
} catch (error) {
    // Log error
    await adminLogger.logError('WEATHER_API_FAILURE', error.message);
    
    // Use cached data
    if (weatherCache.data) {
        weather = weatherCache.data;
    } else {
        // Use default
        weather = getDefaultWeatherData();
    }
}
```

---

## 📈 Performance & Optimization

### Caching Strategy:

- **Weather Data**: Cache 30 phút
- **AI Analysis**: Cache 1 giờ
- **Email History**: Keep last 100
- **Error Logs**: Keep last 500

### API Call Limits:

- **OpenWeather**: 1000 calls/day → ~41 calls/hour → OK
- **Gemini AI**: 60 calls/minute → 3600 calls/hour → OK
- **EmailJS**: 200 emails/month (free) → ~6 emails/day → OK

### Best Practices:

1. ✅ Always use try-catch
2. ✅ Log all errors to Firebase
3. ✅ Provide fallback for all APIs
4. ✅ Cache aggressively
5. ✅ Notify admin on HIGH/CRITICAL errors
6. ✅ Test regularly

---

## 🔒 Security

### API Keys:
- ⚠️ **OpenWeather**: Public (OK, no sensitive data)
- ⚠️ **Gemini**: Public (OK, read-only)
- ⚠️ **EmailJS**: Public Key only (OK, safe)
- ✅ **Firebase**: Private (secured by rules)

### Firebase Rules (khuyến nghị):

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId",
        "error_notifications": {
          ".read": "$userId == 'tuan'",
          ".write": true
        }
      }
    }
  }
}
```

---

## 📞 Support & Troubleshooting

### Common Issues:

1. **Weather không load**:
   - Check API key
   - Check internet connection
   - Check browser console
   - Check quota (1000 calls/day)

2. **AI không phân tích**:
   - Check Gemini API key
   - Check quota (60 req/min)
   - Check CORS (enable từ domain)

3. **Email không gửi**:
   - Check EmailJS setup (Service + Template)
   - Check Public Key
   - Check email format
   - Check spam folder

4. **Error notifications không hiện**:
   - Check Firebase connection
   - Check adminLogger imported
   - Check console for errors
   - Hard refresh (Ctrl + F5)

### Debug Mode:

```javascript
// Enable debug logging
localStorage.setItem('debug_weather', 'true');

// Check weather cache
console.log('Weather cache:', weatherCache);

// Check error logger
console.log('Admin logger:', window.adminLogger);

// Test error logging
window.adminLogger.logError('TEST', 'This is a test error', {
    source: 'manual_test',
    test: true
});
```

---

## 🎉 Hoàn Thành!

### Files Created:

1. ✅ `js/weather-service.js` - Weather API + AI service
2. ✅ `js/error-logger.js` - Admin error tracking
3. ✅ `js/email-service.js` - EmailJS integration
4. ✅ `weather-admin.html` - Full admin dashboard
5. ✅ `EMAILJS_SETUP.md` - EmailJS configuration guide
6. ✅ `WEATHER_SYSTEM_README.md` - This file!

### Files Modified:

1. ✅ `tuan-functions.html` - Added error notifications UI
2. ✅ `quynh-functions.html` - Added weather widget

### Next Steps:

1. 📧 **Setup EmailJS** (theo hướng dẫn EMAILJS_SETUP.md)
2. 🧪 **Test hệ thống**:
   - Vào `weather-admin.html` để test
   - Gửi test email
   - Check error notifications
3. 🚀 **Deploy lên server** (nếu cần)
4. 📊 **Monitor errors** qua admin dashboard

---

## 💡 Ideas for Future:

- 📱 Push notifications (browser notification API)
- 📊 Weather history & analytics
- 🌍 Multi-city support
- 🔔 Custom reminder times cho mỗi user
- 📈 Email open tracking
- 🤖 More AI features (schedule optimization)

---

**Developed with ❤️ for UniSchedule**
**Powered by OpenWeather, Google Gemini & EmailJS**

