// js/data/database.js

// 1. Import các hàm cần thiết từ Firebase SDK (Đã cập nhật)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, get, push, update, remove } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// 2. Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyDh0ySHo7sOpgOQ4Ygi1fchXj0LnY6fE2o",
  authDomain: "unisched-app-11368.firebaseapp.com",
  databaseURL: "https://unisched-app-11368-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "unisched-app-11368",
  storageBucket: "unisched-app-11368.firebasestorage.app",
  messagingSenderId: "407354626561",
  appId: "1:407354626561:web:f3624719bb9ae185a4a600"
};

// 3. Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/**
 * Hàm lấy dữ liệu profile của một người dùng.
 */
export async function getUserProfile(userId) {
  const userRef = ref(db, `users/${userId}/profile`);
  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No data available for this user");
      return null;
    }
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu profile:", error);
    return null;
  }
}

/**
 * Hàm lấy TẤT CẢ sự kiện của một người dùng.
 */
export async function getUserEvents(userId) {
  const eventsRef = ref(db, `users/${userId}/events`);
  try {
    const snapshot = await get(eventsRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return {}; // Trả về đối tượng rỗng nếu không có sự kiện
    }
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu sự kiện:", error);
    return null;
  }
}

/**
 * Hàm thêm một sự kiện mới vào database cho người dùng.
 */
export function addEvent(userId, eventData) {
  const eventsRef = ref(db, `users/${userId}/events`);
  // Dùng push() để Firebase tự tạo một ID duy nhất
  return push(eventsRef, eventData);
}

/**
 * [MỚI] Hàm CẬP NHẬT một sự kiện đã có.
 * @param {string} userId - 'tuan' hoặc 'quynh'
 * @param {string} eventId - ID của sự kiện cần cập nhật
 * @param {object} eventData - Đối tượng chứa dữ liệu mới
 */
export function updateEvent(userId, eventId, eventData) {
  const eventRef = ref(db, `users/${userId}/events/${eventId}`);
  return update(eventRef, eventData);
}

/**
 * [MỚI] Hàm XÓA một sự kiện.
 * @param {string} userId - 'tuan' hoặc 'quynh'
 * @param {string} eventId - ID của sự kiện cần xóa
 */
export function deleteEvent(userId, eventId) {
  const eventRef = ref(db, `users/${userId}/events/${eventId}`);
  return remove(eventRef);
}