// Prayer Times API
const PRAYER_API_URL = 'https://api.aladhan.com/v1/timingsByCity';
// import premiumFeatures from './premium-features.js'; // Removed as premium features are temporarily disabled

// Default city (can be updated based on user's location)
let currentCity = 'Patuakhali';
let currentCountry = 'BD';

// Update prayer times
async function updatePrayerTimes() {
    try {
        // Check premium status for advanced features
        // const isPremium = premiumFeatures.isPremium; // Commented out as premium features are temporarily disabled
        
        // Add method=2 for Islamic Society of North America (ISNA) calculation method
        // Add school=1 for Hanafi school of thought
        const response = await fetch(`${PRAYER_API_URL}?city=${encodeURIComponent(currentCity)}&country=${currentCountry}&method=2&school=1`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code === 200 && data.data && data.data.timings) {
            const timings = data.data.timings;
            
            // Update prayer cards
            updatePrayerCard('Fajr', timings.Fajr);
            updatePrayerCard('Dhuhr', timings.Dhuhr);
            updatePrayerCard('Asr', timings.Asr);
            updatePrayerCard('Maghrib', timings.Maghrib);
            updatePrayerCard('Isha', timings.Isha);
            
            // Update next prayer
            updateNextPrayer(timings);
            
            // Update location display
            updateLocationDisplay();

            // Always show Qibla direction (moved from premium)
            showQiblaDirection();

            // Always enable push notifications (moved from premium)
            enablePushNotifications(timings);

            // Commented out advanced calculations (premium feature to be implemented later)
            // showAdvancedCalculations();
        } else {
            throw new Error('Invalid response format from prayer times API');
        }
    } catch (error) {
        console.error('Error fetching prayer times:', error);
        showError('Failed to fetch prayer times. Please try again later.');
        
        // Try alternative API endpoint if the first one fails
        try {
            const altResponse = await fetch(`https://api.aladhan.com/v1/timings/${new Date().getTime() / 1000}?latitude=22.3589&longitude=90.3187&method=2&school=1`);
            const altData = await altResponse.json();
            
            if (altData.code === 200 && altData.data && altData.data.timings) {
                const timings = altData.data.timings;
                
                // Update prayer cards
                updatePrayerCard('Fajr', timings.Fajr);
                updatePrayerCard('Dhuhr', timings.Dhuhr);
                updatePrayerCard('Asr', timings.Asr);
                updatePrayerCard('Maghrib', timings.Maghrib);
                updatePrayerCard('Isha', timings.Isha);
                
                // Update next prayer
                updateNextPrayer(timings);
                
                // Update location display
                updateLocationDisplay();
            }
        } catch (altError) {
            console.error('Error fetching prayer times from alternative endpoint:', altError);
            showError('Unable to fetch prayer times. Please check your internet connection and try again.');
        }
    }
}

// Update individual prayer card
function updatePrayerCard(prayer, time) {
    const cards = document.querySelectorAll('.prayer-card');
    const card = Array.from(cards).find(card => card.querySelector('h3').textContent === prayer);
    
    if (card) {
        const timeElement = card.querySelector('.time');
        timeElement.textContent = formatTime(time);
    }
}

// Format time (e.g., "05:30" to "05:30 AM")
function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
}

// Update next prayer
function updateNextPrayer(timings) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
        { name: 'Fajr', time: convertTimeToMinutes(timings.Fajr) },
        { name: 'Dhuhr', time: convertTimeToMinutes(timings.Dhuhr) },
        { name: 'Asr', time: convertTimeToMinutes(timings.Asr) },
        { name: 'Maghrib', time: convertTimeToMinutes(timings.Maghrib) },
        { name: 'Isha', time: convertTimeToMinutes(timings.Isha) }
    ];
    
    let nextPrayer = prayers.find(prayer => prayer.time > currentTime);
    
    if (!nextPrayer) {
        nextPrayer = prayers[0]; // If no next prayer today, first prayer tomorrow
    }
    
    // Update UI to show next prayer
    const nextPrayerElement = document.createElement('div');
    nextPrayerElement.className = 'next-prayer';
    nextPrayerElement.innerHTML = `
        <h3>Next Prayer</h3>
        <p>${nextPrayer.name} - ${formatTime(timings[nextPrayer.name])}</p>
    `;
    
    const existingNextPrayer = document.querySelector('.next-prayer');
    if (existingNextPrayer) {
        existingNextPrayer.remove();
    }
    
    document.querySelector('.prayer-times').prepend(nextPrayerElement);
}

// Convert time string to minutes
function convertTimeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// Show location permission request
function showLocationPermissionRequest() {
    const permissionElement = document.createElement('div');
    permissionElement.className = 'location-permission';
    permissionElement.innerHTML = `
        <div class="permission-content">
            <i class="fas fa-map-marker-alt"></i>
            <h3>Enable Location Access</h3>
            <p>To get accurate prayer times for your location, please enable location access.</p>
            <button class="btn-enable-location">Enable Location</button>
            <button class="btn-use-default">Use Default Location</button>
        </div>
    `;
    
    const existingPermission = document.querySelector('.location-permission');
    if (existingPermission) {
        existingPermission.remove();
    }
    
    document.querySelector('.prayer-times').prepend(permissionElement);
    
    // Add event listeners
    document.querySelector('.btn-enable-location').addEventListener('click', () => {
        getUserLocation();
        permissionElement.remove();
    });
    
    document.querySelector('.btn-use-default').addEventListener('click', () => {
        permissionElement.remove();
        updatePrayerTimes();
    });
}

// Show error message
function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
    `;
    
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    document.querySelector('.prayer-times').prepend(errorElement);
}

// Update location display
function updateLocationDisplay() {
    const locationElement = document.createElement('div');
    locationElement.className = 'location-display';
    locationElement.innerHTML = `
        <i class="fas fa-map-marker-alt"></i>
        <span>${currentCity}, ${currentCountry}</span>
    `;
    
    const existingLocation = document.querySelector('.location-display');
    if (existingLocation) {
        existingLocation.remove();
    }
    
    document.querySelector('.prayer-times').prepend(locationElement);
}

// Get user's location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`);
                    const data = await response.json();
                    
                    currentCity = data.city;
                    currentCountry = data.countryCode;
                    
                    updatePrayerTimes();
                } catch (error) {
                    console.error('Error getting location:', error);
                    showError('Failed to get your location. Using default location.');
                    updatePrayerTimes();
                }
            },
            (error) => {
                console.error('Error getting location:', error);
                showLocationPermissionRequest();
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        showError('Geolocation is not supported by your browser. Using default location.');
        updatePrayerTimes();
    }
}

// Initialize prayer times and setup button listeners
document.addEventListener('DOMContentLoaded', () => {
    getUserLocation();

    // Event listener for the 'Enable Notifications' button
    const enableNotificationsBtn = document.getElementById('enable-notifications');
    if (enableNotificationsBtn) {
        enableNotificationsBtn.addEventListener('click', () => {
            console.log('Enable Notifications button clicked.');
            if (!('Notification' in window)) {
                alert('This browser does not support desktop notification');
                return;
            }

            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    alert('Notification permission granted! Attempting to schedule prayers.');
                    // Call updatePrayerTimes to fetch times and schedule notifications
                    updatePrayerTimes();
                } else if (permission === 'denied') {
                    alert('Notification permission denied. Please enable it in your browser settings.');
                } else if (permission === 'default') {
                    alert('Notification permission request dismissed. Please enable it to receive alerts.');
                }
            });
        });
    }
});

// Update prayer times every hour
setInterval(updatePrayerTimes, 3600000);

// Add styles for location permission and error messages
const style = document.createElement('style');
style.textContent = `
    .location-permission {
        background-color: var(--card-bg);
        padding: 2rem;
        border-radius: 10px;
        margin-bottom: 2rem;
        text-align: center;
        box-shadow: var(--shadow);
    }
    
    .permission-content i {
        font-size: 3rem;
        color: var(--primary-color);
        margin-bottom: 1rem;
    }
    
    .permission-content h3 {
        margin-bottom: 1rem;
        color: var(--text-color);
    }
    
    .permission-content p {
        margin-bottom: 1.5rem;
        color: var(--text-color);
    }
    
    .btn-enable-location,
    .btn-use-default {
        padding: 0.8rem 1.5rem;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: var(--transition);
        margin: 0 0.5rem;
    }
    
    .btn-enable-location {
        background-color: var(--primary-color);
        color: white;
    }
    
    .btn-use-default {
        background-color: transparent;
        border: 2px solid var(--primary-color);
        color: var(--primary-color);
    }
    
    .error-message {
        background-color: #ffebee;
        color: #c62828;
        padding: 1rem;
        border-radius: 10px;
        margin-bottom: 2rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .error-message i {
        font-size: 1.5rem;
    }
    
    .location-display {
        background-color: var(--card-bg);
        padding: 1rem;
        border-radius: 10px;
        margin-bottom: 2rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-color);
    }
    
    .location-display i {
        color: var(--primary-color);
    }
`;
document.head.appendChild(style);

// Premium feature: Show Qibla direction
function showQiblaDirection() {
    // if (!premiumFeatures.isPremium) return; // Removed premium check
    
    const qiblaElement = document.createElement('div');
    qiblaElement.className = 'qibla-direction premium-feature';
    qiblaElement.innerHTML = `
        <h3>Qibla Direction</h3>
        <div class="qibla-compass"></div>
    `;
    
    const existingQibla = document.querySelector('.qibla-direction');
    if (existingQibla) {
        existingQibla.remove();
    }
    
    document.querySelector('.prayer-times').appendChild(qiblaElement);
    
    // Initialize compass
    initializeCompass();
}

// Premium feature: Enable push notifications
function enablePushNotifications(timings) {
    // if (!premiumFeatures.isPremium) return; // Removed premium check
    
    if ('Notification' in window) {
        // Notification.requestPermission().then(permission => { // Permission handled by button click now
        //     if (permission === 'granted') {
                setupPrayerNotifications(timings);
                // Display success message with prayer times - MOVED TO BUTTON CLICK HANDLER
                // let message = 'Prayer time notifications have been set!';
                // if (timings) {
                //     message += '\nNext prayers:\n';
                //     message += `Fajr: ${formatTime(timings.Fajr)}\n`;
                //     message += `Dhuhr: ${formatTime(timings.Dhuhr)}\n`;
                //     message += `Asr: ${formatTime(timings.Asr)}\n`;
                //     message += `Maghrib: ${formatTime(timings.Maghrib)}\n`;
                //     message += `Isha: ${formatTime(timings.Isha)}`;
                // }
                // alert(message);

            // } else if (permission === 'denied') {
            //     alert('Notification permission denied. Please enable it in your browser settings.');
            // } else if (permission === 'default') {
            //     alert('Notification permission request dismissed. Please enable it to receive alerts.');
            // }
        // });
    }
}

// Premium feature: Show advanced calculations
function showAdvancedCalculations() {
    // if (!premiumFeatures.isPremium) return; // Removed premium check
    
    const advancedElement = document.createElement('div');
    advancedElement.className = 'advanced-calculations premium-feature';
    advancedElement.innerHTML = `
        <h3>Advanced Calculations</h3>
        <div class="calculation-methods">
            <select id="calculation-method">
                <option value="2">ISNA</option>
                <option value="3">Muslim World League</option>
                <option value="4">Umm Al-Qura University</option>
                <option value="5">Egyptian General Authority</option>
            </select>
        </div>
    `;
    
    const existingAdvanced = document.querySelector('.advanced-calculations');
    if (existingAdvanced) {
        existingAdvanced.remove();
    }
    
    document.querySelector('.prayer-times').appendChild(advancedElement);
    
    // Add event listener for calculation method changes
    document.getElementById('calculation-method').addEventListener('change', (e) => {
        updatePrayerTimes();
    });
}

// Initialize compass for Qibla direction
function initializeCompass() {
    if ('DeviceOrientationEvent' in window) {
        window.addEventListener('deviceorientation', (event) => {
            const compass = document.querySelector('.qibla-compass');
            if (compass) {
                const rotation = event.alpha;
                compass.style.transform = `rotate(${rotation}deg)`;
            }
        });
    }
}

// Setup prayer notifications
function setupPrayerNotifications(timings) {
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    prayers.forEach(prayer => {
        // Schedule notification for each prayer
        schedulePrayerNotification(prayer, timings);
    });
}

// Schedule notification for a specific prayer
function schedulePrayerNotification(prayerName, timings) {
    const now = new Date();
    const prayerTimeStr = timings[prayerName];
    const [hours, minutes] = prayerTimeStr.split(':').map(Number);

    let prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);

    // If prayer time has already passed for today, schedule for tomorrow
    if (prayerDate.getTime() < now.getTime()) {
        prayerDate.setDate(prayerDate.getDate() + 1);
    }

    const delay = prayerDate.getTime() - now.getTime();

    if (delay > 0) {
        setTimeout(() => {
            new Notification(`${prayerName} Prayer Time`, {
                body: `It's time for ${prayerName} prayer!`,
                icon: 'assets/logo.svg' // You can use your app's logo
            });
            // After notification, schedule for the next day
            schedulePrayerNotification(prayerName, timings);
        }, delay);
    } else {
        // If delay is not positive, it means the prayer was already passed or on the exact minute.
        // Schedule for the next day immediately to cover edge cases.
        prayerDate.setDate(prayerDate.getDate() + 1);
        const nextDayDelay = prayerDate.getTime() - now.getTime();
        setTimeout(() => {
            new Notification(`${prayerName} Prayer Time`, {
                body: `It's time for ${prayerName} prayer!`,
                icon: 'assets/logo.svg'
            });
            schedulePrayerNotification(prayerName, timings);
        }, nextDayDelay > 0 ? nextDayDelay : 1000); // Ensure a positive delay, at least 1 second
    }
}

// Export functions for use in other files
export {
    updatePrayerTimes,
    updatePrayerCard,
    updateNextPrayer,
    showQiblaDirection,
    enablePushNotifications,
    // showAdvancedCalculations // Commented out
}; 