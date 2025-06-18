// Import Hijri Date library
import { HijriDate } from './lib/hijri-date.js';

class HijriCalendar {
    constructor() {
        console.log('Initializing HijriCalendar...');
        this.container = document.querySelector('.calendar-container');
        if (!this.container) {
            console.error('Calendar container not found');
            return;
        }
        console.log('Calendar container found:', this.container);
        
        // Set current date with Patuakhali timezone (UTC+6)
        const now = new Date();
        const patuakhaliOffset = 6 * 60; // UTC+6 in minutes
        const localOffset = now.getTimezoneOffset();
        const totalOffset = patuakhaliOffset + localOffset;
        this.currentDate = new Date(now.getTime() + totalOffset * 60000);
        this.currentHijriDate = new HijriDate(this.currentDate);
        
        // Store today's date for comparison
        this.today = new Date(now.getTime() + totalOffset * 60000);
        this.todayHijri = new HijriDate(this.today);
        
        // Initialize API data
        this.islamicMonths = [];
        this.specialDays = [];
        this.currentIslamicYear = null;
        this.currentIslamicMonth = null;
        
        // Create navigation buttons immediately
        this.createNavigationButtons();
        
        // Fetch all required data
        this.initializeCalendarData();
    }

    async initializeCalendarData() {
        try {
            // Fetch all required data in parallel
            const [monthsResponse, specialDaysResponse, currentYearResponse, currentMonthResponse] = await Promise.all([
                fetch('https://api.aladhan.com/v1/islamicMonths'),
                fetch('https://api.aladhan.com/v1/specialDays'),
                fetch('https://api.aladhan.com/v1/currentIslamicYear'),
                fetch('https://api.aladhan.com/v1/currentIslamicMonth')
            ]);

            const [monthsData, specialDaysData, currentYearData, currentMonthData] = await Promise.all([
                monthsResponse.json(),
                specialDaysResponse.json(),
                currentYearResponse.json(),
                currentMonthResponse.json()
            ]);

            if (monthsData.code === 200 && monthsData.data) {
                this.islamicMonths = monthsData.data;
            } else {
                console.warn('Failed to fetch Islamic months, using fallback data');
                this.islamicMonths = [
                    { number: 1, name: 'Muharram' },
                    { number: 2, name: 'Safar' },
                    { number: 3, name: 'Rabi al-Awwal' },
                    { number: 4, name: 'Rabi al-Thani' },
                    { number: 5, name: 'Jumada al-Awwal' },
                    { number: 6, name: 'Jumada al-Thani' },
                    { number: 7, name: 'Rajab' },
                    { number: 8, name: 'Shaban' },
                    { number: 9, name: 'Ramadan' },
                    { number: 10, name: 'Shawwal' },
                    { number: 11, name: 'Dhu al-Qadah' },
                    { number: 12, name: 'Dhu al-Hijjah' }
                ];
            }

            if (specialDaysData.code === 200 && specialDaysData.data) {
                this.specialDays = specialDaysData.data;
            }

            if (currentYearData.code === 200 && currentYearData.data) {
                this.currentIslamicYear = currentYearData.data;
            }

            if (currentMonthData.code === 200 && currentMonthData.data) {
                this.currentIslamicMonth = currentMonthData.data;
            }

            // Initialize the calendar view
            await this.fetchAndRenderCalendar();
        } catch (error) {
            console.error('Error initializing calendar data:', error);
            // Use fallback data if API calls fail
            this.islamicMonths = [
                { number: 1, name: 'Muharram' },
                { number: 2, name: 'Safar' },
                { number: 3, name: 'Rabi al-Awwal' },
                { number: 4, name: 'Rabi al-Thani' },
                { number: 5, name: 'Jumada al-Awwal' },
                { number: 6, name: 'Jumada al-Thani' },
                { number: 7, name: 'Rajab' },
                { number: 8, name: 'Shaban' },
                { number: 9, name: 'Ramadan' },
                { number: 10, name: 'Shawwal' },
                { number: 11, name: 'Dhu al-Qadah' },
                { number: 12, name: 'Dhu al-Hijjah' }
            ];
            await this.fetchAndRenderCalendar();
        }
    }

    async fetchAndRenderCalendar() {
        try {
            const hijriYear = this.currentHijriDate.getFullYear();
            const hijriMonth = this.currentHijriDate.getMonth() + 1;
            
            // Fetch data from Aladhan API using Hijri to Gregorian conversion with Patuakhali timezone
            const response = await fetch(`https://api.aladhan.com/v1/hToGCalendar/${hijriMonth}/${hijriYear}?latitude=22.3589&longitude=90.3187&method=2&school=1`);
            const data = await response.json();
            
            if (data.code === 200 && data.data) {
                this.calendarData = data.data;
                this.renderCalendar();
            } else {
                console.error('Failed to fetch calendar data:', data);
                // Fallback to local calculation if API fails
                this.renderCalendar();
            }
        } catch (error) {
            console.error('Error fetching calendar data:', error);
            // Fallback to local calculation if API fails
            this.renderCalendar();
        }
    }

    createNavigationButtons() {
        const navButtons = document.createElement('div');
        navButtons.className = 'calendar-nav';
        navButtons.innerHTML = `
            <button class="prev-month"><i class="fas fa-chevron-left"></i></button>
            <h3 class="current-month"></h3>
            <button class="next-month"><i class="fas fa-chevron-right"></i></button>
        `;
        this.container.parentElement.insertBefore(navButtons, this.container);

        // Add event listeners for navigation
        navButtons.querySelector('.prev-month').addEventListener('click', () => {
            this.currentHijriDate.setMonth(this.currentHijriDate.getMonth() - 1);
            this.currentDate = new Date(this.currentHijriDate);
            this.fetchAndRenderCalendar();
        });

        navButtons.querySelector('.next-month').addEventListener('click', () => {
            this.currentHijriDate.setMonth(this.currentHijriDate.getMonth() + 1);
            this.currentDate = new Date(this.currentHijriDate);
            this.fetchAndRenderCalendar();
        });
    }

    getHijriMonthName(month) {
        if (!month || month < 1 || month > 12) {
            console.warn('Invalid month number:', month);
            return 'Unknown';
        }

        if (this.islamicMonths && Array.isArray(this.islamicMonths)) {
            const monthData = this.islamicMonths.find(m => m.number === month);
            if (monthData && monthData.name) {
                return monthData.name;
            }
        }

        // Fallback to hardcoded names if API data is not available
        const months = [
            'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
            'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
            'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'
        ];
        return months[month - 1] || 'Unknown';
    }

    getDaysInMonth(year, month) {
        const lastDay = new HijriDate(year, month + 1, 0);
        return lastDay.getDate();
    }

    isRamadan(month) {
        return month === 9; // 9 is Ramadan in Hijri calendar
    }

    isEidAlFitr(day, month) {
        return month === 10 && day === 1; // First day of Shawwal
    }

    isEidAlAdha(day, month) {
        return month === 12 && day === 10; // 10th day of Dhu al-Hijjah
    }

    isLaylatulQadr(day, month) {
        return month === 9 && (day === 21 || day === 23 || day === 25 || day === 27 || day === 29);
    }

    isFirstDayOfHijriYear(day, month) {
        return month === 1 && day === 1;
    }

    isAshura(day, month) {
        return month === 1 && day === 10;
    }

    isMawlid(day, month) {
        return month === 3 && day === 12;
    }

    isLaylatulBaraat(day, month) {
        return month === 8 && day === 15;
    }

    getSpecialDayInfo(day, month) {
        // First check if we have API data
        if (this.specialDays && Array.isArray(this.specialDays)) {
            const specialDay = this.specialDays.find(sd => 
                sd && sd.hijri && 
                parseInt(sd.hijri.day) === day && 
                parseInt(sd.hijri.month) === month
            );

            if (specialDay) {
                return {
                    class: 'special-day',
                    label: specialDay.name || 'Special Day',
                    description: specialDay.description || specialDay.name || 'Special Islamic Day'
                };
            }
        }

        // Fallback to local special day detection
        if (this.isRamadan(month)) {
            return {
                class: 'ramadan-day',
                label: 'Ramadan',
                description: 'The blessed month of fasting'
            };
        }
        if (this.isEidAlFitr(day, month)) {
            return {
                class: 'eid-day',
                label: 'Eid al-Fitr',
                description: 'Festival of Breaking the Fast'
            };
        }
        if (this.isEidAlAdha(day, month)) {
            return {
                class: 'eid-day',
                label: 'Eid al-Adha',
                description: 'Festival of Sacrifice'
            };
        }
        if (this.isLaylatulQadr(day, month)) {
            return {
                class: 'laylatul-qadr',
                label: 'Laylatul Qadr',
                description: 'Night of Power'
            };
        }
        if (this.isFirstDayOfHijriYear(day, month)) {
            return {
                class: 'hijri-new-year',
                label: 'Islamic New Year',
                description: 'First day of Muharram'
            };
        }
        if (this.isAshura(day, month)) {
            return {
                class: 'ashura',
                label: 'Day of Ashura',
                description: '10th day of Muharram'
            };
        }
        if (this.isMawlid(day, month)) {
            return {
                class: 'mawlid',
                label: 'Mawlid al-Nabi',
                description: 'Birth of Prophet Muhammad (PBUH)'
            };
        }
        if (this.isLaylatulBaraat(day, month)) {
            return {
                class: 'laylatul-baraat',
                label: 'Laylatul Baraat',
                description: 'Night of Forgiveness'
            };
        }
        return null;
    }

    renderCalendar() {
        console.log('Rendering calendar...');
        const hijriYear = this.currentHijriDate.getFullYear();
        const hijriMonth = this.currentHijriDate.getMonth() + 1;

        // Update month display with additional information
        const monthDisplay = document.querySelector('.current-month');
        if (monthDisplay) {
            let displayText = `${this.getHijriMonthName(hijriMonth)} ${hijriYear} AH`;
            if (this.currentIslamicYear === hijriYear) {
                displayText += ' (Current Islamic Year)';
            }
            if (this.currentIslamicMonth === hijriMonth) {
                displayText += ' (Current Islamic Month)';
            }
            monthDisplay.textContent = displayText;
        }

        // Create calendar grid
        const calendar = document.createElement('div');
        calendar.className = 'calendar-grid';

        // Add weekday headers
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const headerRow = document.createElement('div');
        headerRow.className = 'calendar-header';
        weekdays.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day-header';
            dayElement.textContent = day;
            headerRow.appendChild(dayElement);
        });
        calendar.appendChild(headerRow);

        // Create days grid
        const daysGrid = document.createElement('div');
        daysGrid.className = 'calendar-days';

        // Get the first day of the month from API data
        const firstDayData = this.calendarData?.[0];
        const firstDay = firstDayData ? new Date(firstDayData.gregorian.date).getDay() : 0;
        
        // Add empty cells for days before the first of the month
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            daysGrid.appendChild(emptyDay);
        }

        // Add days of the month using API data
        if (this.calendarData) {
            this.calendarData.forEach(dayData => {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                
                // Create Hijri date element
                const hijriDateElement = document.createElement('div');
                hijriDateElement.className = 'hijri-date';
                hijriDateElement.textContent = dayData.hijri.day;
                dayElement.appendChild(hijriDateElement);

                // Create Gregorian date element
                const gregorianDate = document.createElement('div');
                gregorianDate.className = 'gregorian-date';
                gregorianDate.textContent = dayData.gregorian.day;
                dayElement.appendChild(gregorianDate);

                // Add special day indicators
                const specialDay = this.getSpecialDayInfo(
                    parseInt(dayData.hijri.day),
                    parseInt(dayData.hijri.month.number)
                );
                
                if (specialDay) {
                    dayElement.classList.add(specialDay.class);
                    const specialLabel = document.createElement('div');
                    specialLabel.className = 'special-day-label';
                    specialLabel.textContent = specialDay.label;
                    dayElement.appendChild(specialLabel);
                    dayElement.title = specialDay.description;
                }

                // Highlight current day
                const isCurrentDay = dayData.gregorian.date === this.today.toISOString().split('T')[0];
                if (isCurrentDay) {
                    dayElement.classList.add('current-day');
                    const todayLabel = document.createElement('div');
                    todayLabel.className = 'special-day-label';
                    todayLabel.textContent = 'Today';
                    dayElement.appendChild(todayLabel);
                }

                // Add click event to show more details
                dayElement.addEventListener('click', () => {
                    this.showDayDetails(
                        parseInt(dayData.hijri.day),
                        parseInt(dayData.hijri.month.number),
                        parseInt(dayData.hijri.year),
                        new Date(dayData.gregorian.date)
                    );
                });

                daysGrid.appendChild(dayElement);
            });
        }

        calendar.appendChild(daysGrid);
        this.container.innerHTML = '';
        this.container.appendChild(calendar);
        console.log('Calendar rendered successfully');
    }

    showDayDetails(hijriDay, hijriMonth, hijriYear, gregDate) {
        const modal = document.createElement('div');
        modal.className = 'day-details-modal';
        
        const specialDay = this.getSpecialDayInfo(hijriDay, hijriMonth);
        const content = `
            <div class="day-details-content">
                <span class="close-modal">&times;</span>
                <h3>${this.getHijriMonthName(hijriMonth)} ${hijriDay}, ${hijriYear} AH</h3>
                <p>Gregorian: ${gregDate.toLocaleDateString()}</p>
                ${specialDay ? `
                    <div class="special-day-info">
                        <h4>${specialDay.label}</h4>
                        <p>${specialDay.description}</p>
                    </div>
                ` : ''}
                <div class="day-info">
                    <p>Day ${hijriDay} of ${this.getHijriMonthName(hijriMonth)}</p>
                    <p>Year ${hijriYear} AH</p>
                </div>
            </div>
        `;
        
        modal.innerHTML = content;
        document.body.appendChild(modal);

        // Close modal when clicking the close button or outside the modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating calendar...');
    const calendar = new HijriCalendar();
});

// Add calendar styles
const style = document.createElement('style');
style.textContent = `
    .calendar-grid {
        background-color: var(--bg-color);
        border-radius: 10px;
        padding: 1rem;
    }

    .calendar-header {
        text-align: center;
        margin-bottom: 1rem;
    }

    .calendar-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
    }

    .calendar-nav button {
        background: none;
        border: none;
        color: var(--text-color);
        cursor: pointer;
        font-size: 1.2rem;
    }

    .calendar-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .day-name {
        text-align: center;
        font-weight: bold;
        color: var(--primary-color);
    }

    .calendar-grid-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0.5rem;
    }

    .calendar-day {
        aspect-ratio: 1;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 0.5rem;
        position: relative;
    }

    .calendar-day.empty {
        border: none;
    }

    .calendar-day.current-day {
        background-color: var(--primary-color);
        color: white;
    }

    .day-number {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        font-weight: bold;
    }

    .day-content {
        margin-top: 1.5rem;
        font-size: 0.9rem;
    }

    .ramadan-day {
        display: block;
        color: var(--primary-color);
        font-weight: bold;
    }

    .day-dua {
        margin-top: 0.5rem;
        font-size: 0.8rem;
        line-height: 1.4;
    }

    @media (max-width: 768px) {
        .calendar-grid {
            padding: 0.5rem;
        }

        .day-content {
            font-size: 0.8rem;
        }

        .day-dua {
            font-size: 0.7rem;
        }
    }
`;
document.head.appendChild(style); 