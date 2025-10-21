# 📧 Tạo Email Template - Hướng Dẫn Nhanh

## ✅ Đã Sửa Template ID Thành: `weather_reminder`

---

## 🚀 Các Bước Tạo Template

### **Bước 1: Mở EmailJS Templates**
```
https://dashboard.emailjs.com/admin/templates
```

### **Bước 2: Create New Template**
Click nút **"Create New Template"**

### **Bước 3: Điền Thông Tin**

#### **Template Settings:**
- **Template Name**: `Weather Reminder`
- **Template ID**: `weather_reminder` ← **QUAN TRỌNG!**

#### **Email Subject:**
```
🌤️ Lịch học hôm nay - {{schedule_date}} | Dự báo thời tiết Đà Nẵng
```

#### **Email Content:**
Copy toàn bộ HTML dưới đây và paste vào ô **Content**:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #ff6b9d 0%, #8e44ad 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 14px;
        }
        .body {
            padding: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #ff6b9d;
            margin-bottom: 15px;
        }
        .weather-box {
            background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 5px solid #007aff;
        }
        .temp {
            font-size: 36px;
            font-weight: bold;
            color: #007aff;
        }
        .desc {
            font-size: 16px;
            color: #666;
            margin-top: 10px;
        }
        .details {
            margin-top: 15px;
            font-size: 14px;
            color: #666;
        }
        .ai-box {
            background: linear-gradient(135deg, #fff0f6 0%, #ffe5ec 100%);
            border-radius: 15px;
            padding: 20px;
            border-left: 5px solid #ff6b9d;
            margin-bottom: 20px;
        }
        .ai-title {
            font-weight: bold;
            color: #ff6b9d;
            margin-bottom: 10px;
        }
        .ai-text {
            line-height: 1.8;
            color: #333;
        }
        .reminder {
            background: linear-gradient(135deg, #ffab73 0%, #ff6b9d 100%);
            color: white;
            padding: 15px;
            border-radius: 15px;
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin-top: 20px;
        }
        .footer {
            background: #f8f8f8;
            padding: 20px;
            text-align: center;
            border-top: 3px solid #ff6b9d;
        }
        .footer p {
            margin: 5px 0;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌤️ Lịch Học & Thời Tiết Hôm Nay</h1>
            <p>{{schedule_date}}</p>
        </div>

        <div class="body">
            <div class="section-title">🌤️ Dự Báo Thời Tiết Đà Nẵng</div>
            
            <div class="weather-box">
                <div class="temp">{{weather_temp}}°C</div>
                <div class="desc">{{weather_description}}</div>
                <div class="details">
                    💧 Độ ẩm: {{weather_humidity}}% | 
                    🌡️ Cảm giác: {{weather_feels_like}}°C | 
                    💨 Gió: {{weather_wind_speed}} m/s | 
                    👁️ Tầm nhìn: {{weather_visibility}} km
                </div>
            </div>

            <div class="ai-box">
                <div class="ai-title">🤖 Lời Khuyên Từ AI</div>
                <div class="ai-text">{{ai_weather_advice}}</div>
            </div>

            <div class="section-title">📅 Lịch Học Hôm Nay</div>
            {{{schedule_list}}}

            <div class="reminder">
                💕 Chúc em học tốt và giữ gìn sức khỏe nhé! 💕
            </div>
        </div>

        <div class="footer">
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

#### **Test Variables (Settings tab):**
```json
{
  "schedule_date": "Thứ Hai, 21/10/2024",
  "weather_temp": "28",
  "weather_description": "Trời nắng nhẹ",
  "weather_humidity": "75",
  "weather_feels_like": "30",
  "weather_wind_speed": "4.2",
  "weather_visibility": "10",
  "ai_weather_advice": "Hôm nay thời tiết Đà Nẵng khá nóng với nhiệt độ 28°C. Em nhớ mang theo nước uống và đội mũ khi ra ngoài nhé! Chúc em học tốt! 💕",
  "schedule_list": "<div style='background:#ffeef2;padding:20px;border-radius:15px;margin-bottom:15px;'><div style='font-size:18px;font-weight:bold;color:#ff6b9d;margin-bottom:10px;'>⏰ 07:00 - 09:00</div><div style='margin:5px 0;'>📚 Môn học: Toán Cao Cấp</div><div style='margin:5px 0;'>👨‍🏫 Giảng viên: TS. Nguyễn Văn A</div><div style='margin:5px 0;'>📍 Phòng: A101</div><div style='margin:5px 0;'>🏢 Cơ sở: Cơ sở 1</div></div>"
}
```

### **Bước 4: Save Template**
Click **Save**

### **Bước 5: Test Email (Optional)**
1. Click tab **"Test"**
2. Nhập email của bạn
3. Click **"Send Test Email"**
4. Check inbox!

---

## ✅ Checklist

- [ ] Template ID: `weather_reminder` (chính xác!)
- [ ] Subject có emoji 🌤️
- [ ] HTML đã paste đầy đủ
- [ ] Test variables đã điền
- [ ] Đã save thành công
- [ ] Template hiện trong list

---

## 🎯 Sau Khi Tạo Xong

### **Test trong Weather Admin:**
1. Mở: `weather-admin.html?user=tuan`
2. Nhập email
3. Nhập Public Key: `ImtCj0ncism-01z07`
4. Click "Gửi Email Test"

**Kết quả mong đợi:**
```
✅ Email đã được gửi thành công!
```

---

## 🆘 Nếu Lỗi

### **Template ID không match:**
```
❌ Error: Template 'weather_reminder' not found
```
→ Check lại Template ID trong EmailJS dashboard

### **Variables thiếu:**
```
❌ Error: Missing required variables
```
→ Check tất cả variables trong Settings tab

---

**Good luck! 🚀**

