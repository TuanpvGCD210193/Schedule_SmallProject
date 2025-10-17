import { getUserEvents, addEvent } from './data/database.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const backButton = document.getElementById('back-to-functions-btn');
    const monthYearHeader = document.getElementById('month-year-header');
    const weekGrid = document.getElementById('week-view-grid');
    const timeAxis = document.getElementById('time-axis');
    const prevWeekBtn = document.getElementById('prev-week-btn');
    const nextWeekBtn = document.getElementById('next-week-btn');
    
    // Modal elements
    const addEventFab = document.getElementById('add-event-fab');
    const eventModal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-title');
    const eventForm = document.getElementById('event-form');
    const cancelBtn = document.getElementById('cancel-btn');
    
    // Modal mode elements
    const eventModeBtn = document.getElementById('event-mode-btn');
    const scheduleModeBtn = document.getElementById('schedule-mode-btn');
    const singleEventFields = document.getElementById('single-event-fields');
    const recurringFields = document.getElementById('recurring-fields');
    const weekdayButtons = document.querySelectorAll('.weekday-btn');

    // --- State ---
    const urlParams = new URLSearchParams(window.location.search);
    const currentUser = urlParams.get('user');
    let currentDate = new Date();
    let userEvents = {};
    let currentModalMode = 'event';

    // --- HÀM QUẢN LÝ MODAL ---
    function setModalMode(mode) {
        currentModalMode = mode;
        if (mode === 'event') {
            modalTitle.textContent = 'Tạo Sự Kiện Mới';
            document.getElementById('event-title').placeholder = "VD: Họp nhóm dự án";
            eventModeBtn.classList.add('active');
            scheduleModeBtn.classList.remove('active');
            singleEventFields.classList.remove('hidden');
            recurringFields.classList.add('hidden');
        } else {
            modalTitle.textContent = 'Tạo Lịch Học Mới';
            document.getElementById('event-title').placeholder = "VD: Phát triển ứng dụng Web";
            scheduleModeBtn.classList.add('active');
            eventModeBtn.classList.remove('active');
            recurringFields.classList.remove('hidden');
            singleEventFields.classList.add('hidden');
        }
    }

    const openModal = () => {
        setModalMode('event'); 
        eventModal.classList.remove('hidden');
    };
    const closeModal = () => {
        eventModal.classList.add('hidden');
        eventForm.reset();
        weekdayButtons.forEach(btn => btn.classList.remove('active'));
    };
    
    // --- HÀM HELPER VÀ RENDER ---
    
    function createTimeAxisLabels() {
        timeAxis.innerHTML = '';
        for (let hour = 0; hour < 24; hour++) {
            const hourString = hour.toString().padStart(2, '0') + ':00';
            timeAxis.innerHTML += `<div class="time-label-line">${hourString}</div>`;
        }
    }

    function getWeekDays(date) {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay()); 
        const week = []; 
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            week.push(day); 
        }
        return week;
    }

    function createEventElement(event) {
        const element = document.createElement('div');
        element.className = 'event-box';
        
        const startHour = parseInt(event.startTime.split(':')[0]);
        const startMinute = parseInt(event.startTime.split(':')[1]);
        const endHour = parseInt(event.endTime.split(':')[0]);
        const endMinute = parseInt(event.endTime.split(':')[1]);

        const totalStartMinutes = startHour * 60 + startMinute;
        const totalEndMinutes = endHour * 60 + endMinute;
        const durationMinutes = totalEndMinutes - totalStartMinutes;
        
        element.style.top = `${totalStartMinutes}px`;
        element.style.height = `${durationMinutes}px`;

        element.innerHTML = `
            <p class="event-subject">${event.subjectName || event.title}</p>
            <p class="event-time">${event.startTime} - ${event.endTime}</p>
            <p class="event-classroom">${event.classroom || ''}</p>
        `;
        return element;
    }

    function renderEventsForWeek(weekDays) {
        const dayColumns = document.querySelectorAll('.day-column');

        dayColumns.forEach((dayColumn, index) => {
            const day = weekDays[index];
            if (!dayColumn || !day) return;
            dayColumn.innerHTML = '';

            const dateKey = `${day.getFullYear()}${(day.getMonth() + 1).toString().padStart(2, '0')}${day.getDate().toString().padStart(2, '0')}`;
            const dateString = day.toISOString().split('T')[0];

            for (const eventId in userEvents) {
                const event = userEvents[eventId];
                
                if (event.type === 'single' && event.date === dateString) {
                    dayColumn.appendChild(createEventElement(event));
                }

                if (event.type === 'recurring' && event.daysOfWeek) {
                    const exceptions = event.exceptions || {};
                    const startDate = new Date(event.startDate);
                    const endDate = new Date(event.endDate);
                    
                    if (exceptions[dateKey]?.status === 'cancelled') continue;
                    
                    // SỬA LẠI LOGIC KIỂM TRA NGÀY: Đơn giản và chính xác hơn
                    if (day >= startDate && day <= endDate && event.daysOfWeek.includes(day.getDay())) {
                        dayColumn.appendChild(createEventElement(event));
                    }

                    if (exceptions[dateKey]?.status === 'added') {
                        const addedEvent = { ...event, ...exceptions[dateKey], subjectName: event.subjectName + ' (Bù)' };
                        dayColumn.appendChild(createEventElement(addedEvent));
                    }
                }
            }
        });
    }

    function renderWeek(dateInWeek) {
        weekGrid.innerHTML = '';
        const weekDays = getWeekDays(dateInWeek);
        const today = new Date();
        const firstDay = weekDays[0];
        const lastDay = weekDays[6];
        monthYearHeader.textContent = `Tháng ${firstDay.getMonth() + 1}, ${firstDay.getFullYear()}`;
        if (firstDay.getMonth() !== lastDay.getMonth()) {
            monthYearHeader.textContent = `Thg ${firstDay.getMonth() + 1} - Thg ${lastDay.getMonth() + 1}, ${lastDay.getFullYear()}`;
        }
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
        for (let i = 0; i < 7; i++) {
            weekGrid.innerHTML += `<div class="day-column"></div>`;
        }
        renderEventsForWeek(weekDays);
    }
    
    // --- KHỞI TẠO TRANG ---
    async function initialize() {
        if (currentUser) {
            document.body.setAttribute('data-theme', currentUser);
            userEvents = await getUserEvents(currentUser) || {};
        }

        createTimeAxisLabels();

        // Gán sự kiện
        backButton.addEventListener('click', () => window.history.back());
        addEventFab.addEventListener('click', openModal);
        cancelBtn.addEventListener('click', closeModal);
        eventModal.addEventListener('click', (e) => { if (e.target === eventModal) closeModal(); });

        eventModeBtn.addEventListener('click', () => setModalMode('event'));
        scheduleModeBtn.addEventListener('click', () => setModalMode('schedule'));

        weekdayButtons.forEach(button => {
            button.addEventListener('click', () => button.classList.toggle('active'));
        });

        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let newEventData = {};

            if (currentModalMode === 'event') {
                newEventData = {
                    type: 'single',
                    title: document.getElementById('event-title').value,
                    date: document.getElementById('single-date').value,
                    startTime: document.getElementById('start-time').value,
                    endTime: document.getElementById('end-time').value,
                };
            } else { // 'schedule' mode
                const selectedDays = Array.from(weekdayButtons)
                    .filter(btn => btn.classList.contains('active'))
                    .map(btn => parseInt(btn.dataset.day));
                
                // CẬP NHẬT LẠI LOGIC LƯU DỮ LIỆU
                newEventData = {
                    type: "recurring",
                    subjectName: document.getElementById('event-title').value,
                    campus: document.getElementById('event-campus').value, // Thêm mới
                    classroom: document.getElementById('event-classroom').value, // Thêm mới
                    startTime: document.getElementById('start-time').value,
                    endTime: document.getElementById('end-time').value,
                    startDate: document.getElementById('start-date').value,
                    endDate: document.getElementById('end-date').value,
                    daysOfWeek: selectedDays,
                };
            }
            
            try {
                await addEvent(currentUser, newEventData);
                alert('Thêm thành công!');
                closeModal();
                userEvents = await getUserEvents(currentUser) || {};
                renderWeek(currentDate);
            } catch (error) {
                console.error("Lỗi khi lưu:", error);
                alert('Có lỗi xảy ra, vui lòng thử lại.');
            }
        });

        nextWeekBtn.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() + 7);
            renderWeek(currentDate);
        });

        prevWeekBtn.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() - 7);
            renderWeek(currentDate);
        });
        
        renderWeek(currentDate);
    }

    initialize();
});