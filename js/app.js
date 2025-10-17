document.addEventListener('DOMContentLoaded', () => {
    const profileCards = document.querySelectorAll('.profile-card');

    profileCards.forEach(card => {
        card.addEventListener('click', () => {
            const user = card.dataset.user;
            if (user === 'quynh') {
                // Chuyển hướng sang trang chức năng của Quỳnh
                // và đính kèm tên user vào URL
                window.location.href = `quynh-functions.html?user=${user}`;
            } else if (user === 'tuan') {
                alert('Chức năng cho Tuân sẽ được phát triển sau!');
            }
        });
    });
});