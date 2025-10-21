# 🤖 Gemini AI Setup Guide

## ❌ Lỗi 404 - Không tìm thấy API

Nếu bạn gặp lỗi:
```
❌ AI Error: Gemini API Error: 404 - Not Found
```

Có 3 nguyên nhân chính:

---

## 🔍 **1. API Key Không Hợp Lệ**

### Kiểm tra API Key:

1. **Truy cập Google AI Studio:**
   - Đi tới: https://aistudio.google.com/app/apikey
   - Đăng nhập bằng Google account

2. **Tạo API Key mới:**
   - Click "**Create API Key**"
   - Chọn project hoặc tạo mới
   - Copy API key (dạng: `AIzaSy...`)

3. **Cập nhật API Key trong code:**

**File:** `js/weather-service.js` (dòng 13)

```javascript
const GEMINI_CONFIG = {
    API_KEY: 'PASTE_YOUR_NEW_API_KEY_HERE', // ← Thay thế ở đây
    MODEL: 'gemini-1.5-flash',
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    TIMEOUT: 10000,
    ENABLED: true,
};
```

---

## 🔧 **2. Model Name Không Đúng**

### Các model hiện có (tháng 10/2025):

| Model Name | Trạng thái | Khuyến nghị |
|------------|-----------|-------------|
| `gemini-1.5-flash` | ✅ Active | **Khuyến nghị** (nhanh, miễn phí) |
| `gemini-1.5-pro` | ⚠️ Deprecated | Không dùng |
| `gemini-pro` | ⚠️ Deprecated | Không dùng |

### Thay đổi model:

```javascript
const GEMINI_CONFIG = {
    API_KEY: 'your-api-key',
    MODEL: 'gemini-1.5-flash', // ← Model tốt nhất
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    TIMEOUT: 10000,
    ENABLED: true,
};
```

---

## 🌐 **3. API Endpoint Không Đúng**

### Endpoint đúng cho Gemini 1.5:

```
✅ ĐÚNG: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent

❌ SAI: https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent
```

**Lưu ý:** 
- Gemini 1.5 sử dụng **`v1beta`** (không phải `v1`)
- Model name phải khớp với URL

---

## 🔒 **4. API Key Bị Giới Hạn**

### Kiểm tra quota:

1. Truy cập: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com
2. Chọn project
3. Xem **Quotas & System Limits**

### Giới hạn miễn phí:

- **15 requests/minute**
- **1,500 requests/day**
- **1 million tokens/day**

Nếu vượt quota → đợi reset hoặc upgrade plan.

---

## 🛠️ **5. Tắt AI Tạm Thời**

Nếu không muốn sử dụng AI (chỉ dùng fallback tips):

**File:** `js/weather-service.js` (dòng 17)

```javascript
const GEMINI_CONFIG = {
    API_KEY: 'your-api-key',
    MODEL: 'gemini-1.5-flash',
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    TIMEOUT: 10000,
    ENABLED: false, // ← Đổi thành false để tắt AI
};
```

Khi `ENABLED: false`:
- Không gọi Gemini API
- Sử dụng fallback tips (thông báo đơn giản)
- Không mất quota

---

## 🧪 **6. Test API Key**

### Cách test nhanh:

**Mở Console trong browser (F12) và chạy:**

```javascript
// Test Gemini API
const testGemini = async () => {
    const API_KEY = 'YOUR_API_KEY_HERE';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: 'Hello, AI!' }]
            }]
        })
    });
    
    if (response.ok) {
        const data = await response.json();
        console.log('✅ API Key hoạt động!', data);
    } else {
        const error = await response.text();
        console.error('❌ API Key lỗi:', error);
    }
};

testGemini();
```

**Kết quả:**
- ✅ `200 OK` → API key hợp lệ
- ❌ `404 Not Found` → Sai endpoint hoặc model
- ❌ `403 Forbidden` → API key không hợp lệ
- ❌ `429 Too Many Requests` → Vượt quota

---

## 📋 **Checklist Debug**

- [ ] API Key mới từ https://aistudio.google.com/app/apikey
- [ ] Model name: `gemini-1.5-flash`
- [ ] Endpoint: `v1beta` (không phải `v1`)
- [ ] Quota chưa vượt giới hạn
- [ ] `ENABLED: true` trong config
- [ ] Test API key thành công

---

## 💡 **Alternative: Tắt AI**

Nếu không muốn dùng AI hoặc không có API key:

1. Mở `js/weather-service.js`
2. Đổi `ENABLED: false`
3. Hệ thống sẽ dùng fallback tips (thông báo đơn giản nhưng vẫn hữu ích)

**Fallback tips mẫu:**
- ☀️ Trời nắng → Nhớ mang nước, đội mũ
- 🌧️ Trời mưa → Mang ô, đi cẩn thận
- ☁️ Trời nhiều mây → Mang ô dự phòng

---

## 🔗 **Resources**

- **Google AI Studio:** https://aistudio.google.com/
- **Gemini API Docs:** https://ai.google.dev/gemini-api/docs
- **API Key Dashboard:** https://console.cloud.google.com/apis/credentials
- **Gemini Release Notes:** https://ai.google.dev/gemini-api/docs/changelog

---

## ✅ **Khi Thành Công**

Console sẽ hiển thị:

```
✅ Weather data fetched in XXms
✅ AI tip generated in XXXms: [AI advice]
✅ Weather widget loaded
```

Thay vì:

```
❌ AI Error: Gemini API Error: 404
🔄 Using fallback tip: ...
```

---

**Nếu vẫn gặp lỗi, kiểm tra console log để xem error body chi tiết!**

