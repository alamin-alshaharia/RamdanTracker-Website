// Theme Toggle
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update icon
    const icon = themeToggle.querySelector('i');
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
});

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
    const icon = themeToggle.querySelector('i');
    icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Ramadan Countdown (Dynamic)
let ramadanStartDate = null;

async function fetchRamadanStart(year) {
    // Aladhan API: Get Gregorian date for 1 Ramadan of the given year
    const url = `https://api.aladhan.com/v1/gToH?date=1-1-${year}`;
    try {
        // Find the Hijri year for Jan 1st of this Gregorian year
        const res = await fetch(url);
        const data = await res.json();
        if (data.code === 200 && data.data && data.data.hijri) {
            const hijriYear = data.data.hijri.year;
            // Now get Gregorian date for 1 Ramadan of that Hijri year
            const ramadanUrl = `https://api.aladhan.com/v1/hToG?date=1-9-${hijriYear}`;
            const res2 = await fetch(ramadanUrl);
            const data2 = await res2.json();
            if (data2.code === 200 && data2.data && data2.data.gregorian) {
                return data2.data.gregorian.date; // Format: DD-MM-YYYY
            }
        }
    } catch (e) {
        // API failed
    }
    return null;
}

function parseDateDMY(dateStr) {
    // Format: DD-MM-YYYY
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0);
}

async function setupRamadanCountdown() {
    const now = new Date();
    const year = now.getFullYear();
    let ramadanDateStr = await fetchRamadanStart(year);
    let ramadanDate = ramadanDateStr ? parseDateDMY(ramadanDateStr) : null;
    if (!ramadanDate || ramadanDate < now) {
        // If Ramadan already passed this year, get for next year
        ramadanDateStr = await fetchRamadanStart(year + 1);
        ramadanDate = ramadanDateStr ? parseDateDMY(ramadanDateStr) : null;
    }
    // Fallback: use a static date if all else fails
    if (!ramadanDate) {
        ramadanDate = new Date('2024-03-10T00:00:00');
    }
    ramadanStartDate = ramadanDate;
    updateCountdown();
}

function updateCountdown() {
    if (!ramadanStartDate) return;
    const now = new Date();
    const timeLeft = ramadanStartDate - now;
    if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    } else {
        document.getElementById('countdown-timer').innerHTML = '<h2>Ramadan has begun!</h2>';
    }
}

// Update countdown every second
setInterval(updateCountdown, 1000);
setupRamadanCountdown();

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile Navigation
const createMobileNav = () => {
    const nav = document.querySelector('.nav-links');
    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav';
    
    const links = Array.from(nav.children);
    links.forEach(link => {
        const mobileLink = link.cloneNode(true);
        mobileNav.appendChild(mobileLink);
    });
    
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    
    document.querySelector('.navbar').appendChild(hamburger);
    document.body.appendChild(mobileNav);
    
    hamburger.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
};

// Initialize mobile navigation if screen width is small
if (window.innerWidth <= 768) {
    createMobileNav();
}

// Add mobile navigation styles
const style = document.createElement('style');
style.textContent = `
    .mobile-nav {
        position: fixed;
        top: 0;
        right: -100%;
        width: 70%;
        height: 100vh;
        background-color: var(--bg-color);
        padding: 2rem;
        transition: right 0.3s ease;
        z-index: 1001;
    }
    
    .mobile-nav.active {
        right: 0;
    }
    
    .mobile-nav a {
        display: block;
        padding: 1rem 0;
        color: var(--text-color);
        text-decoration: none;
        border-bottom: 1px solid #ddd;
    }
    
    .hamburger {
        display: none;
        background: none;
        border: none;
        color: var(--text-color);
        font-size: 1.5rem;
        cursor: pointer;
    }
    
    @media (max-width: 768px) {
        .hamburger {
            display: block;
        }
    }
`;
document.head.appendChild(style);

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

document.querySelectorAll('.prayer-card, .calendar-container, .quran-progress').forEach(el => {
    observer.observe(el);
});

// Temporarily comment out HTTPS redirect for local development
/*
if (location.protocol === 'http:') {
  location.replace('https://' + location.hostname + location.pathname + location.search + location.hash);
}
*/ 