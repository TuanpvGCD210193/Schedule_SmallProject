// Import hàm addEvent mới
import { getUserEvents, addEvent } from './data/database.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const backButton = document.getElementById('back-to-functions-btn');
    const monthYearHeader = document.getElementById('month-year-header');
    const weekGrid = document.getElementById('week-view-grid');
    const prevWeekBtn = document.getElementById('prev-week-btn');
    const nextWeekBtn = document.getElementById('next-week-btn');
    
    // Mới: Lấy các element của Modal và Form
    const addEventFab = document.getElementById('add-event-fab');
    const eventModal = document.getElementById('event-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const eventForm = document.getElementById('event-form');
    const weekdayButtons = document.querySelectorAll('.weekday-btn');

    // --- State ---
    const urlParams = new URLSearchParams(window.location.search);
    const currentUser = urlParams.get('user');
    let currentDate = new Date();
    let userEvents = {};

    // --- HÀM QUẢN LÝ MODAL ---
    const openModal = () => eventModal.classList.remove('hidden');
    const closeModal = () => {
        eventModal.classList.add('hidden');
        eventForm.reset(); // Xóa dữ liệu đã nhập trong form
        weekdayButtons.forEach(btn => btn.classList.remove('active')); // Bỏ chọn các ngày
    };

    // ===================================
    // HÀM HELPER VÀ RENDER (ĐÃ HOÀN THIỆN)
    // ===================================

    /**
     * Lấy mảng 7 ngày trong tuần chứa ngày được cung cấp
     */
    function getWeekDays(date) {
        const startOfWeek = new Date(date);
        // Lùi ngày về Chủ Nhật của tuần đó (ngày đầu tiên trong tuần theo getDay())
        startOfWeek.setDate(date.getDate() - date.getDay()); 
        
        const week = []; 
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            week.push(day); // Thêm lần lượt 7 ngày vào mảng
        }
        return week;
    }

    /**
     * Tạo một phần tử HTML cho sự kiện
     */
    function createEventElement(event) {
        const element = document.createElement('div');
        element.className = 'event-box';
        
        // Tính toán vị trí và chiều cao dựa trên thời gian
        const startHour = parseInt(event.startTime.split(':')[0]);
        const startMinute = parseInt(event.startTime.split(':')[1]);
        const endHour = parseInt(event.endTime.split(':')[0]);
        const endMinute = parseInt(event.endTime.split(':')[1]);

        const totalStartMinutes = startHour * 60 + startMinute;
        const totalEndMinutes = endHour * 60 + endMinute;
        const durationMinutes = totalEndMinutes - totalStartMinutes;
        
        // Giả định 1 phút = 1px (Chiếm 1440px/ngày)
        element.style.top = `${totalStartMinutes}px`;
        element.style.height = `${durationMinutes}px`;

        element.innerHTML = `
            <p class="event-subject">${event.subjectName}</p>
            <p class="event-time">${event.startTime} - ${event.endTime}</p>
            <p class="event-classroom">${event.classroom || ''}</p>
        `;
        return element;
    }

    /**
     * Render các sự kiện cho tuần hiện tại
     */
    function renderEventsForWeek(weekDays) {
        const dayColumns = document.querySelectorAll('.day-column');

        weekDays.forEach((day, index) => {
            const dayColumn = dayColumns[index];
            if (!dayColumn) return;

            // Xóa sự kiện cũ trước khi vẽ lại
            dayColumn.innerHTML = '';

            const dateKey = `${day.getFullYear()}${(day.getMonth() + 1).toString().padStart(2, '0')}${day.getDate().toString().padStart(2, '0')}`;

            for (const eventId in userEvents) {
                const event = userEvents[eventId];
                const exceptions = event.exceptions || {};

                // A. XỬ LÝ SỰ KIỆN LẶP LẠI (RECURRING)
                if (event.type === 'recurring') {
                    const startDate = new Date(event.startDate);
                    const endDate = new Date(event.endDate);
                    // JS getDay(): CN=0, T2=1,..., T7=6. Cần quy đổi: T2=2, T3=3, ... CN=7
                    const dayOfWeek = day.getDay() === 0 ? 7 : day.getDay();
                    const dayOfWeekMapped = dayOfWeek === 7 ? 7 : dayOfWeek + 1;


                    // KIỂM TRA NGOẠI LỆ: Nếu ngày này bị hủy, bỏ qua
                    if (exceptions[dateKey] && exceptions[dateKey].status === 'cancelled') {
                        continue; 
                    }

                    // TÍNH TOÁN NGÀY HỌC
                    if (day >= startDate && day <= endDate && event.daysOfWeek.includes(dayOfWeekMapped)) {
                        const eventElement = createEventElement(event);
                        dayColumn.appendChild(eventElement);
                    }
                }

                // B. XỬ LÝ CÁC BUỔI HỌC BÙ (ADDED) HOẶC SỰ KIỆN ĐƠN
                if (exceptions[dateKey] && exceptions[dateKey].status === 'added') {
                    // Tạo một sự kiện tạm thời với thông tin được ghi đè
                    const addedEvent = {
                        ...event, // Lấy thông tin gốc (tên môn, lớp...)
                        ...exceptions[dateKey], // Ghi đè thời gian mới
                        subjectName: event.subjectName + ' (Bù)' // Thêm nhãn Bù
                    };
                    const eventElement = createEventElement(addedEvent);
                    dayColumn.appendChild(eventElement);
                }
            }
        });
    }

    /**
     * VẼ GIAO DIỆN LỊCH TUẦN (HEADER, NGÀY)
     */
    function renderWeek(dateInWeek) {
        weekGrid.innerHTML = '';
        const weekDays = getWeekDays(dateInWeek);
        const today = new Date();

        // Cập nhật header Tháng/Năm
        const firstDay = weekDays[0];
        const lastDay = weekDays[6];
        
        // Điều chỉnh lại tiêu đề tháng/năm
        const firstMonthName = `Thg ${firstDay.getMonth() + 1}`;
        const lastMonthName = `Thg ${lastDay.getMonth() + 1}`;
        monthYearHeader.textContent = (firstDay.getMonth() !== lastDay.getMonth()) 
            ? `${firstMonthName} - ${lastMonthName}, ${lastDay.getFullYear()}`
            : `Tháng ${firstDay.getMonth() + 1}, ${firstDay.getFullYear()}`;
        
        
        // Thêm cột trống cho giờ và 7 cột ngày (header)
        weekGrid.innerHTML += `<div></div>`; 
        const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        weekDays.forEach(day => {
            const isToday = day.toDateString() === today.toDateString();
            weekGrid.innerHTML += `
                <div class="day-header">
                    <div class="day-label">${dayLabels[day.getDay()]}</div>
                    <div class="date-label ${isToday ? 'today' : ''}">${day.getDate()}</div>
                </div>
            `;
        });

        // Thêm các cột giờ (time-slot-labels)
        weekGrid.innerHTML += `<div class="time-slot-labels">`;
        for(let hour = 0; hour < 24; hour++) {
            const hourString = hour.toString().padStart(2, '0') + ':00';
            weekGrid.innerHTML += `<div class="time-label">${hourString}</div>`;
        }
        weekGrid.innerHTML += `</div>`;
        
        // Thêm 7 cột ngày cho sự kiện
        for (let i = 0; i < 7; i++) {
            weekGrid.innerHTML += `<div class="day-column" style="height: 1440px;"></div>`;
        }

        renderEventsForWeek(weekDays);
    }


    /**
     * Khởi tạo trang và gán tất cả sự kiện
     */
    async function initialize() {
        if (currentUser) {
            document.body.setAttribute('data-theme', currentUser);
            userEvents = await getUserEvents(currentUser);
        }

        if (backButton) {
            backButton.addEventListener('click', () => window.history.back());
        }

        // --- GÁN SỰ KIỆN CHO MODAL & FORM ---
        addEventFab.addEventListener('click', openModal);
        cancelBtn.addEventListener('click', closeModal);
        eventModal.addEventListener('click', (e) => {
            if (e.target === eventModal) {
                closeModal();
            }
        });

        // Xử lý chọn các ngày trong tuần
        weekdayButtons.forEach(button => {
            button.addEventListener('click', () => {
                button.classList.toggle('active');
            });
        });

        // Xử lý khi nhấn nút "Lưu" (submit form)
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const selectedDays = Array.from(weekdayButtons)
                .filter(btn => btn.classList.contains('active'))
                .map(btn => parseInt(btn.dataset.day));

            const newEventData = {
                type: "recurring",
                subjectName: document.getElementById('event-title').value,
                startTime: document.getElementById('start-time').value,
                endTime: document.getElementById('end-time').value,
                startDate: document.getElementById('start-date').value,
                endDate: document.getElementById('end-date').value,
                daysOfWeek: selectedDays,
                // Tạm thời để trống các trường này
                campus: "", 
                classroom: ""
            };
            
            // VALIDATION: Kiểm tra xem có chọn ngày nào không
            if (selectedDays.length === 0) {
                alert("Vui lòng chọn ít nhất một ngày trong tuần để lặp lại!");
                return;
            }
            
            try {
                await addEvent(currentUser, newEventData);
                alert('Thêm lịch học thành công!');
                closeModal();
                // Tải lại dữ liệu và render lại lịch để thấy sự kiện mới
                userEvents = await getUserEvents(currentUser);
                renderWeek(currentDate);
            } catch (error) {
                console.error("Lỗi khi lưu sự kiện:", error);
                alert('Có lỗi xảy ra, vui lòng thử lại.');
            }
        });

        // --- GÁN SỰ KIỆN CHO CÁC NÚT ĐIỀU HƯỚNG TUẦN ---
        nextWeekBtn.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() + 7);
            renderWeek(currentDate);
        });

        prevWeekBtn.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() - 7);
            renderWeek(currentDate);
        });
        
        // Dòng khởi tạo trang
        renderWeek(currentDate); 
    }

    initialize();
});