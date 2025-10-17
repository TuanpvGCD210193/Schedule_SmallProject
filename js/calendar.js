import { getUserEvents, addEvent, updateEvent, deleteEvent } from './data/database.js';

document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // DOM ELEMENTS
    // ============================================
    const backButton = document.getElementById('back-to-functions-btn');
    const monthYearHeader = document.getElementById('month-year-header');
    const weekGrid = document.getElementById('week-view-grid');
    const timeAxis = document.getElementById('time-axis');
    const prevWeekBtn = document.getElementById('prev-week-btn');
    const nextWeekBtn = document.getElementById('next-week-btn');
    const todayBtn = document.getElementById('today-btn');
    
    // View toggle buttons
    const viewDayBtn = document.getElementById('view-day-btn');
    const viewWeekBtn = document.getElementById('view-week-btn');
    const viewMonthBtn = document.getElementById('view-month-btn');
    
    // Search & Filter
    const searchToggleBtn = document.getElementById('search-toggle-btn');
    const filterToggleBtn = document.getElementById('filter-toggle-btn');
    const searchFilterBar = document.getElementById('search-filter-bar');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    
    // Modal elements
    const addEventFab = document.getElementById('add-event-fab');
    const eventModal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-title');
    const eventForm = document.getElementById('event-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');
    const deleteBtn = document.getElementById('delete-btn');
    
    // Modal mode elements
    const eventModeBtn = document.getElementById('event-mode-btn');
    const scheduleModeBtn = document.getElementById('schedule-mode-btn');
    const singleEventFields = document.getElementById('single-event-fields');
    const recurringFields = document.getElementById('recurring-fields');
    const weekdayButtons = document.querySelectorAll('.weekday-btn');
    const categoryButtons = document.querySelectorAll('.category-btn');

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    const urlParams = new URLSearchParams(window.location.search);
    const currentUser = urlParams.get('user');
    let currentDate = new Date();
    let userEvents = {};
    let currentModalMode = 'event';
    let currentViewMode = 'week'; // 'day', 'week', 'month'
    let selectedCategory = 'personal';
    let editingEventId = null;
    let searchQuery = '';
    let filterCategory = 'all';
    // Visible day range configuration (05:00 to 23:00)
    const DAY_START_HOUR = 5; // 05:00
    const DAY_END_HOUR = 23;  // 23:00
    const MINUTES_PER_HOUR = 60;
    const DAY_START_MINUTES = DAY_START_HOUR * MINUTES_PER_HOUR;
    const DAY_END_MINUTES = DAY_END_HOUR * MINUTES_PER_HOUR;
    const VISIBLE_RANGE_MINUTES = DAY_END_MINUTES - DAY_START_MINUTES; // 1080 minutes

    // ============================================
    // MODAL MANAGEMENT
    // ============================================
    function setModalMode(mode) {
        currentModalMode = mode;
        if (mode === 'event') {
            modalTitle.textContent = editingEventId ? 'Chỉnh sửa Sự kiện' : 'Tạo Sự Kiện Mới';
            document.getElementById('event-title').placeholder = "VD: Họp nhóm dự án";
            eventModeBtn.classList.add('active');
            scheduleModeBtn.classList.remove('active');
            singleEventFields.classList.remove('hidden');
            recurringFields.classList.add('hidden');
        } else {
            modalTitle.textContent = editingEventId ? 'Chỉnh sửa Lịch Học' : 'Tạo Lịch Học Mới';
            document.getElementById('event-title').placeholder = "VD: Phát triển ứng dụng Web";
            scheduleModeBtn.classList.add('active');
            eventModeBtn.classList.remove('active');
            recurringFields.classList.remove('hidden');
            singleEventFields.classList.add('hidden');
        }
    }

    function openModal(eventId = null) {
        editingEventId = eventId;
        
        if (eventId && userEvents[eventId]) {
            // Edit mode
            const event = userEvents[eventId];
            setModalMode(event.type === 'single' ? 'event' : 'schedule');
            populateFormWithEvent(event);
            deleteBtn.classList.remove('hidden');
        } else {
            // Create mode
            setModalMode('event');
            eventForm.reset();
            setTodayAsDefault();
            deleteBtn.classList.add('hidden');
        }
        
        eventModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        eventModal.classList.add('hidden');
        document.body.style.overflow = '';
        eventForm.reset();
        editingEventId = null;
        weekdayButtons.forEach(btn => btn.classList.remove('active'));
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        categoryButtons[0].classList.add('active');
        selectedCategory = 'personal';
    }

    function populateFormWithEvent(event) {
        document.getElementById('event-title').value = event.title || event.subjectName || '';
        document.getElementById('start-time').value = event.startTime || '';
        document.getElementById('end-time').value = event.endTime || '';
        document.getElementById('event-description').value = event.description || '';
        
        // Set category
        selectedCategory = event.category || 'personal';
        categoryButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === selectedCategory);
        });
        
        if (event.type === 'single') {
            document.getElementById('single-date').value = event.date || '';
        } else {
            document.getElementById('event-campus').value = event.campus || '';
            document.getElementById('event-classroom').value = event.classroom || '';
            document.getElementById('start-date').value = event.startDate || '';
            document.getElementById('end-date').value = event.endDate || '';
            
            // Set weekdays
            if (event.daysOfWeek) {
                weekdayButtons.forEach(btn => {
                    const day = parseInt(btn.dataset.day);
                    btn.classList.toggle('active', event.daysOfWeek.includes(day));
                });
            }
        }
    }

    function setTodayAsDefault() {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        document.getElementById('single-date').value = dateString;
        document.getElementById('start-date').value = dateString;
        
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        document.getElementById('end-date').value = nextMonth.toISOString().split('T')[0];
    }

    // ============================================
    // TIME AXIS & GRID SETUP
    // ============================================
    function createTimeAxisLabels() {
        timeAxis.innerHTML = '';
        const paddingDiv = document.createElement('div');
        paddingDiv.style.height = '82px'; // Chiều cao của day header
        timeAxis.appendChild(paddingDiv);
        
        for (let hour = DAY_START_HOUR; hour < DAY_END_HOUR; hour++) {
            const hourString = hour.toString().padStart(2, '0') + ':00';
            const div = document.createElement('div');
            div.className = 'time-label-line';
            div.textContent = hourString;
            timeAxis.appendChild(div);
        }
    }

    function getWeekDays(date) {
        const startOfWeek = new Date(date);
        const dayOfWeek = startOfWeek.getDay();
        startOfWeek.setDate(date.getDate() - dayOfWeek);
        
        const week = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            week.push(day);
        }
        return week;
    }

    // ============================================
    // EVENT CREATION & RENDERING
    // ============================================
    function createEventElement(event, eventId) {
        const element = document.createElement('div');
        element.className = 'event-box';
        element.dataset.eventId = eventId;
        
        // Add category class
        const category = event.category || 'personal';
        element.classList.add(`category-${category}`);
        
        if (event.type === 'recurring') {
            element.classList.add('type-recurring');
        }
        
        // Calculate position
        const startHour = parseInt(event.startTime.split(':')[0]);
        const startMinute = parseInt(event.startTime.split(':')[1]);
        const endHour = parseInt(event.endTime.split(':')[0]);
        const endMinute = parseInt(event.endTime.split(':')[1]);

        const totalStartMinutes = startHour * 60 + startMinute;
        const totalEndMinutes = endHour * 60 + endMinute;
        // Clamp to visible range 05:00-23:00 and offset top from 05:00
        const visibleStart = Math.max(totalStartMinutes, DAY_START_MINUTES);
        const visibleEnd = Math.min(totalEndMinutes, DAY_END_MINUTES);
        const visibleDuration = visibleEnd - visibleStart;
        if (visibleDuration <= 0) return null;
        
        const hourHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour-height')) || 60;
        const pxPerMinute = hourHeight / 60;
        element.style.top = `${(visibleStart - DAY_START_MINUTES) * pxPerMinute}px`;
        element.style.height = `${Math.max(visibleDuration * pxPerMinute, 30)}px`;

        // Add content
        const title = event.subjectName || event.title || 'Không có tiêu đề';
        const timeStr = `${event.startTime} - ${event.endTime}`;
        const location = event.classroom || event.campus || '';
        
        element.innerHTML = `
            <div class="event-actions">
                <button class="event-action-btn edit-event" data-event-id="${eventId}" title="Chỉnh sửa">
                    ✏️
                </button>
            </div>
            <p class="event-subject">${title}</p>
            <p class="event-time">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${timeStr}
            </p>
            ${location ? `<p class="event-classroom">📍 ${location}</p>` : ''}
        `;
        
        // Click to view/edit
        element.addEventListener('click', (e) => {
            if (!e.target.closest('.event-action-btn')) {
                openModal(eventId);
            }
        });
        
        return element;
    }

    function filterEvents(events) {
        return Object.entries(events).filter(([id, event]) => {
            // Filter by category
            if (filterCategory !== 'all' && event.category !== filterCategory) {
                return false;
            }
            
            // Filter by search query
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                const title = (event.title || event.subjectName || '').toLowerCase();
                const description = (event.description || '').toLowerCase();
                const location = (event.classroom || event.campus || '').toLowerCase();
                
                return title.includes(searchLower) || 
                       description.includes(searchLower) || 
                       location.includes(searchLower);
            }
            
            return true;
        });
    }

    function renderEventsForWeek(weekDays) {
        const dayColumns = document.querySelectorAll('.day-column');
        const filteredEvents = filterEvents(userEvents);

        dayColumns.forEach((dayColumn, index) => {
            const day = weekDays[index];
            if (!dayColumn || !day) return;
            dayColumn.innerHTML = '';

            const dateKey = `${day.getFullYear()}${(day.getMonth() + 1).toString().padStart(2, '0')}${day.getDate().toString().padStart(2, '0')}`;
            const dateString = day.toISOString().split('T')[0];

            filteredEvents.forEach(([eventId, event]) => {
                if (event.type === 'single' && event.date === dateString) {
                    const el = createEventElement(event, eventId);
                    if (el) dayColumn.appendChild(el);
                }

                if (event.type === 'recurring' && event.daysOfWeek) {
                    const exceptions = event.exceptions || {};
                    const startDate = event.startDate ? new Date(event.startDate) : null;
                    const endDate = event.endDate ? new Date(event.endDate) : null;
                    // Normalize daysOfWeek to numbers in case they come as strings from DB
                    const normalizedDaysOfWeek = Array.isArray(event.daysOfWeek)
                        ? event.daysOfWeek.map(d => parseInt(d, 10))
                        : [];
                    
                    if (exceptions[dateKey]?.status === 'cancelled') return;
                    
                    const inRange = (!startDate || day >= startDate) && (!endDate || day <= endDate);
                    if (inRange && normalizedDaysOfWeek.includes(day.getDay())) {
                        const el = createEventElement(event, eventId);
                        if (el) dayColumn.appendChild(el);
                    }

                    if (exceptions[dateKey]?.status === 'added') {
                        const addedEvent = { ...event, ...exceptions[dateKey], subjectName: event.subjectName + ' (Bù)' };
                        const el2 = createEventElement(addedEvent, eventId);
                        if (el2) dayColumn.appendChild(el2);
                    }
                }
            });
        });
    }

    // ============================================
    // WEEK VIEW RENDERING
    // ============================================
    function renderWeek(dateInWeek) {
        weekGrid.innerHTML = '';
        const weekDays = getWeekDays(dateInWeek);
        const today = new Date();
        const firstDay = weekDays[0];
        const lastDay = weekDays[6];
        
        // Update header text
        if (firstDay.getMonth() !== lastDay.getMonth()) {
            monthYearHeader.textContent = `Thg ${firstDay.getMonth() + 1} - Thg ${lastDay.getMonth() + 1}, ${lastDay.getFullYear()}`;
        } else {
            monthYearHeader.textContent = `Tháng ${firstDay.getMonth() + 1}, ${firstDay.getFullYear()}`;
        }
        
        const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        
        // Render day headers
        weekDays.forEach(day => {
            const isToday = day.toDateString() === today.toDateString();
            weekGrid.innerHTML += `
                <div class="day-header">
                    <div class="day-label">${dayLabels[day.getDay()]}</div>
                    <div class="date-label ${isToday ? 'today' : ''}">${day.getDate()}</div>
                </div>
            `;
        });
        
        // Render day columns
        for (let i = 0; i < 7; i++) {
            weekGrid.innerHTML += `<div class="day-column" data-day-index="${i}"></div>`;
        }
        
        renderEventsForWeek(weekDays);
        setupDragToCreate(weekDays);
        // syncTimeAxisPadding();
    }

    // function syncTimeAxisPadding() {
    //     const header = weekGrid.querySelector('.day-header');
    //     if (!header) return;
    //     timeAxis.style.paddingTop = header.offsetHeight + 'px';
    // }

    // ============================================
    // DRAG TO CREATE EVENT
    // ============================================
    function setupDragToCreate(weekDays) {
        const dayColumns = document.querySelectorAll('.day-column');
        
        dayColumns.forEach((column, index) => {
            let isDragging = false;
            let startY = 0;
            let startTime = '';
            
            column.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('event-box') || e.target.closest('.event-box')) {
                    return;
                }
                
                isDragging = true;
                startY = e.offsetY;
                const hourHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour-height')) || 60;
                const minutesPerPixel = 60 / hourHeight;
                const clampedStartOffset = Math.max(0, Math.min(VISIBLE_RANGE_MINUTES, Math.floor(startY * minutesPerPixel)));
                const startTotalMinutes = DAY_START_MINUTES + clampedStartOffset;
                const hour = Math.floor(startTotalMinutes / 60);
                const minute = Math.floor(startTotalMinutes % 60);
                startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            });
            
            column.addEventListener('mouseup', (e) => {
                if (!isDragging) return;
                isDragging = false;
                
                const endY = e.offsetY;
                const hourHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour-height')) || 60;
                const minutesPerPixel = 60 / hourHeight;
                const clampedEndOffset = Math.max(0, Math.min(VISIBLE_RANGE_MINUTES, Math.floor(endY * minutesPerPixel)));
                const endTotalMinutes = DAY_START_MINUTES + clampedEndOffset;
                const endHour = Math.floor(endTotalMinutes / 60);
                const endMinute = Math.floor(endTotalMinutes % 60);
                const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
                
                // Only create if drag is significant (at least 15 minutes)
                if (Math.abs(endY - startY) > 15) {
                    const selectedDate = weekDays[index];
                    const dateString = selectedDate.toISOString().split('T')[0];
                    
                    // Open modal with pre-filled data
                    openModal();
                    document.getElementById('single-date').value = dateString;
                    // Ensure chronological order
                    const startParts = startTime.split(':').map(n => parseInt(n, 10));
                    const endParts = endTime.split(':').map(n => parseInt(n, 10));
                    const startTotal = startParts[0] * 60 + startParts[1];
                    const endTotal = endParts[0] * 60 + endParts[1];
                    const first = Math.min(startTotal, endTotal);
                    const second = Math.max(startTotal, endTotal);
                    const firstStr = `${Math.floor(first / 60).toString().padStart(2, '0')}:${(first % 60).toString().padStart(2, '0')}`;
                    const secondStr = `${Math.floor(second / 60).toString().padStart(2, '0')}:${(second % 60).toString().padStart(2, '0')}`;
                    document.getElementById('start-time').value = firstStr;
                    document.getElementById('end-time').value = secondStr;
                }
            });
        });
    }

    // ============================================
    // SEARCH & FILTER
    // ============================================
    function toggleSearchFilter() {
        searchFilterBar.classList.toggle('hidden');
        if (!searchFilterBar.classList.contains('hidden')) {
            searchInput.focus();
        }
    }

    searchToggleBtn.addEventListener('click', toggleSearchFilter);
    filterToggleBtn.addEventListener('click', toggleSearchFilter);

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderWeek(currentDate);
    });

    categoryFilter.addEventListener('change', (e) => {
        filterCategory = e.target.value;
        renderWeek(currentDate);
    });

    // ============================================
    // VIEW MODE SWITCHING
    // ============================================
    function setViewMode(mode) {
        currentViewMode = mode;
        
        // Update active button
        [viewDayBtn, viewWeekBtn, viewMonthBtn].forEach(btn => btn.classList.remove('active'));
        
        if (mode === 'day') {
            viewDayBtn.classList.add('active');
            // TODO: Implement day view
            alert('Chế độ xem Ngày đang được phát triển!');
        } else if (mode === 'week') {
            viewWeekBtn.classList.add('active');
            renderWeek(currentDate);
            attachHoverHearts();
        } else if (mode === 'month') {
            viewMonthBtn.classList.add('active');
            // TODO: Implement month view
            alert('Chế độ xem Tháng đang được phát triển!');
        }
    }

    viewDayBtn.addEventListener('click', () => setViewMode('day'));
    viewWeekBtn.addEventListener('click', () => setViewMode('week'));
    viewMonthBtn.addEventListener('click', () => setViewMode('month'));

    // ============================================
    // NAVIGATION
    // ============================================
    nextWeekBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 7);
        renderWeek(currentDate);
    });

    prevWeekBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 7);
        renderWeek(currentDate);
    });

    todayBtn.addEventListener('click', () => {
        currentDate = new Date();
        renderWeek(currentDate);
    });

    // ============================================
    // CATEGORY SELECTION
    // ============================================
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedCategory = button.dataset.category;
        });
    });

    // ============================================
    // WEEKDAY SELECTION
    // ============================================
    weekdayButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('active');
        });
    });

    // ============================================
    // MODAL CONTROLS
    // ============================================
    addEventFab.addEventListener('click', (e) => {
        openModal();
        // Quynh-themed heart on FAB click
        if (document.body.getAttribute('data-theme') === 'quynh') {
            const rect = addEventFab.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            spawnHearts(x, y, 3);
        }
    });
    cancelBtn.addEventListener('click', closeModal);
    eventModal.addEventListener('click', (e) => {
        if (e.target === eventModal) closeModal();
    });

    eventModeBtn.addEventListener('click', () => setModalMode('event'));
    scheduleModeBtn.addEventListener('click', () => setModalMode('schedule'));

    // ============================================
    // FORM SUBMISSION
    // ============================================
    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let eventData = {};
        const title = document.getElementById('event-title').value;
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;
        const description = document.getElementById('event-description').value;
        

        const startHour = parseInt(startTime.split(':')[0]);
    if (startHour < 5 || startHour >= 23) {
        showNotification('Giờ bắt đầu phải từ 05:00 đến 23:00! ⏰', 'error');
        return;
    }
    
    // Kiểm tra giờ kết thúc
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinute = parseInt(endTime.split(':')[1]);
    if (endHour > 23 || (endHour === 23 && endMinute > 0)) {
        showNotification('Giờ kết thúc không được quá 23:00! ⏰', 'error');
        return;
    }
    
    if (startTime >= endTime) {
        showNotification('Thời gian kết thúc phải sau thời gian bắt đầu! ⏰', 'error');
        return;
    }

        if (currentModalMode === 'event') {
            eventData = {
                type: 'single',
                title: title,
                date: document.getElementById('single-date').value,
                startTime: startTime,
                endTime: endTime,
                category: selectedCategory,
                description: description,
            };
        } else {
            const selectedDays = Array.from(weekdayButtons)
                .filter(btn => btn.classList.contains('active'))
                .map(btn => parseInt(btn.dataset.day));
            
            if (selectedDays.length === 0) {
                alert('Vui lòng chọn ít nhất một ngày trong tuần!');
                return;
            }
            
            eventData = {
                type: 'recurring',
                subjectName: title,
                campus: document.getElementById('event-campus').value,
                classroom: document.getElementById('event-classroom').value,
                startTime: startTime,
                endTime: endTime,
                startDate: document.getElementById('start-date').value,
                endDate: document.getElementById('end-date').value,
                daysOfWeek: selectedDays,
                category: selectedCategory,
                description: description,
            };
        }
        
        try {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Đang lưu...';
            
            if (editingEventId) {
                await updateEvent(currentUser, editingEventId, eventData);
                showNotification('Cập nhật thành công!', 'success');
            } else {
                await addEvent(currentUser, eventData);
                showNotification('Thêm sự kiện thành công!', 'success');
            }
            
            closeModal();
            userEvents = await getUserEvents(currentUser) || {};
            renderWeek(currentDate);
            attachHoverHearts();
        } catch (error) {
            console.error('Lỗi khi lưu:', error);
            showNotification('Có lỗi xảy ra, vui lòng thử lại!', 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Lưu';
        }
    });

    // ============================================
    // DELETE EVENT
    // ============================================
    deleteBtn.addEventListener('click', async () => {
        if (!editingEventId) return;
        
        const confirmed = confirm('Bạn có chắc chắn muốn xóa sự kiện này?');
        if (!confirmed) return;
        
        try {
            deleteBtn.disabled = true;
            deleteBtn.textContent = 'Đang xóa...';
            
            await deleteEvent(currentUser, editingEventId);
            showNotification('Đã xóa sự kiện!', 'success');
            
            closeModal();
            userEvents = await getUserEvents(currentUser) || {};
            renderWeek(currentDate);
        } catch (error) {
            console.error('Lỗi khi xóa:', error);
            showNotification('Không thể xóa sự kiện!', 'error');
        } finally {
            deleteBtn.disabled = false;
            deleteBtn.textContent = 'Xóa';
        }
    });

    // ============================================
    // NOTIFICATION SYSTEM
    // ============================================
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInFromRight 0.3s ease;
            font-weight: 600;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInFromRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================
    document.addEventListener('keydown', (e) => {
        // Escape to close modal
        if (e.key === 'Escape' && !eventModal.classList.contains('hidden')) {
            closeModal();
        }
        
        // Ctrl/Cmd + N to create new event
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            openModal();
        }
        
        // Ctrl/Cmd + F to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            if (searchFilterBar.classList.contains('hidden')) {
                toggleSearchFilter();
            } else {
                searchInput.focus();
            }
        }
        
        // Arrow keys for navigation
        if (!eventModal.classList.contains('hidden')) return;
        
        if (e.key === 'ArrowLeft') {
            prevWeekBtn.click();
        } else if (e.key === 'ArrowRight') {
            nextWeekBtn.click();
        } else if (e.key === 't') {
            todayBtn.click();
        }
    });

    // ============================================
    // BACK BUTTON
    // ============================================
    backButton.addEventListener('click', () => {
        window.history.back();
    });

    // ============================================
    // INITIALIZATION
    // ============================================
    async function initialize() {
        if (!currentUser) {
            alert('Không tìm thấy thông tin người dùng!');
            window.location.href = 'index.html';
            return;
        }

        // Apply theme
        document.body.setAttribute('data-theme', currentUser);

        // Show loading
        weekGrid.innerHTML = `
            <div class="loading-spinner" style="grid-column: 1 / -1;">
                <div class="spinner"></div>
            </div>
        `;

        try {
            // Load user events
            userEvents = await getUserEvents(currentUser) || {};
            
            // Setup time axis
            createTimeAxisLabels();
            
            // Set default date
            setTodayAsDefault();
            
            // Initial render
            renderWeek(currentDate);
            syncTimeAxisPadding();
            window.addEventListener('resize', syncTimeAxisPadding);
            
            // Show welcome notification
            setTimeout(() => {
                showNotification(`Chào mừng ${currentUser === 'quynh' ? 'Quỳnh' : 'Tuân'}! 👋`, 'success');
            }, 500);
            
        } catch (error) {
            console.error('Lỗi khi khởi tạo:', error);
            weekGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">⚠️</div>
                    <div class="empty-state-text">Không thể tải dữ liệu</div>
                    <div class="empty-state-subtext">Vui lòng thử lại sau</div>
                </div>
            `;
        }
    }

    // ============================================
    // EMAIL NOTIFICATION SCHEDULER (Preparation)
    // ============================================
    function scheduleEmailNotifications() {
        // TODO: Implement email notifications
        // - Daily summary at 10 PM
        // - "Good luck studying" during class time
        // - 1 hour before events
        console.log('Email notification scheduler initialized');
    }

    // ============================================
    // HEART ANIMATION (Quỳnh theme only)
    // ============================================
    function createHeartAnimation(x, y) {
        if (document.body.getAttribute('data-theme') !== 'quynh') return;
        const heart = document.createElement('div');
        heart.className = 'heart-decoration';
        heart.textContent = '💖';
        heart.style.left = x + 'px';
        heart.style.top = y + 'px';
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 3000);
    }

    function spawnHearts(x, y, count) {
        if (document.body.getAttribute('data-theme') !== 'quynh') return;
        const num = Math.max(1, count || 1);
        for (let i = 0; i < num; i++) {
            const dx = (Math.random() - 0.5) * 40; // spread
            const dy = (Math.random() - 0.5) * 20;
            setTimeout(() => createHeartAnimation(x + dx, y + dy), i * 80);
        }
    }

    function attachHoverHearts() {
        if (document.body.getAttribute('data-theme') !== 'quynh') return;
        const dayColumns = document.querySelectorAll('.day-column');
        dayColumns.forEach(column => {
            // more frequent on hover movement
            const handler = (e) => {
                if (Math.random() > 0.6) {
                    spawnHearts(e.clientX, e.clientY, 2);
                }
            };
            column.addEventListener('mousemove', handler);
        });
    }

    // Start the app
    initialize();
    scheduleEmailNotifications();
});