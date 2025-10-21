# ⚡ Quick Start - Weather System

## 🎯 Để Bắt Đầu Ngay (5 phút)

### 1. Open Weather Admin Dashboard
```
http://your-domain/weather-admin.html?user=tuan
```

### 2. Setup EmailJS (One-time)

#### A. Lấy Public Key:
1. Vào: https://dashboard.emailjs.com/admin/account
2. Copy **Public Key**

#### B. Tạo Email Template:
1. Vào: https://dashboard.emailjs.com/admin/templates
2. Create New Template
3. Template ID: `weather_reminder`
4. Paste HTML từ file `EMAILJS_SETUP.md`
5. Save

### 3. Test Email
1. Trong Weather Admin Dashboard
2. Nhập email của bạn
3. Nhập EmailJS Public Key (từ bước 2A)
4. Click "📧 Gửi Email Test"
5. Check inbox!

---

## 📋 Các Trang Chính

### Cho Quỳnh:
- **`quynh-functions.html`** - Dashboard với weather widget

### Cho Tuân:
- **`tuan-functions.html`** - Dashboard với error notifications
- **`weather-admin.html`** - Full weather control panel

---

## 🔑 API Keys (Đã có sẵn)

✅ OpenWeather: `4d10eed7e65a8444dcf7eb1fda3ea36f`
✅ Gemini AI: `AIzaSyCFuNJ0RYORLNATGP3GGcxi8T-xZweDPfY`
✅ EmailJS Service: `service_q9mploa`
✅ EmailJS Template: `weather_reminder`
❌ EmailJS Public Key: **CẦN LẤY TỪ DASHBOARD**

---

## 🧪 Test Checklist

- [ ] Weather widget hiển thị ở quynh-functions.html
- [ ] AI phân tích thời tiết work
- [ ] Error notifications hiển thị ở tuan-functions.html  
- [ ] Weather admin dashboard load đúng
- [ ] Test email gửi thành công
- [ ] Error logging work (check Firebase)

---

## 🆘 Nếu Có Lỗi

### Weather không load:
```javascript
// Check console
console.log('Testing weather...');
import('./js/weather-service.js').then(m => m.fetchWeatherData().then(console.log));
```

### Email không gửi:
- Check EmailJS Public Key
- Check Template ID: `weather_reminder`
- Check Service ID: `service_q9mploa`

### Error notifications không hiện:
```javascript
// Test error logger
window.adminLogger.logError('TEST', 'Test error message', {
    source: 'manual_test',
    user_affected: 'quynh'
});
```

---

## 📚 Chi Tiết Hơn

- Full documentation: `WEATHER_SYSTEM_README.md`
- EmailJS setup: `EMAILJS_SETUP.md`

---

**That's it! Hệ thống sẵn sàng! 🚀**

