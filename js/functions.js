import { getUserProfile } from './data/database.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const functionCards = document.querySelectorAll('.function-card');
    const userProfileDisplay = document.getElementById('current-user-profile');

    // --- Logic ---
    // 1. Lấy tên user từ URL (ví dụ: ?user=quynh)
    const urlParams = new URLSearchParams(window.location.search);
    const currentUser = urlParams.get('user');

    // Nếu không có user trong URL, không làm gì cả
    if (!currentUser) {
        console.error("Không tìm thấy thông tin người dùng trong URL.");
        return;
    }

    // 2. Áp dụng theme và tải dữ liệu profile
    document.body.setAttribute('data-theme', currentUser);
    
    getUserProfile(currentUser)
        .then(profile => {
            if (profile) {
                userProfileDisplay.innerHTML = `
                    <img src="assets/${currentUser}-avatar.jpg" alt="Avatar" class="profile-card__avatar">
                    <p class="profile-card__name">${profile.name}</p>
                `;
            }
        })
        .catch(error => console.error("Lỗi khi tải profile:", error));
    
    // 3. Gán sự kiện cho các thẻ chức năng
    functionCards.forEach(card => {
    card.addEventListener('click', (event) => {
        event.preventDefault();
        
        // Lấy giá trị từ data-attribute. Khi click "Lịch", functionName sẽ là "calendar"
        const functionName = card.dataset.function;
        
        // Dựng URL động và chuyển trang
        // Kết quả: "calendar.html?user=quynh"
        window.location.href = `${functionName}.html?user=${currentUser}`;
    });
});
});