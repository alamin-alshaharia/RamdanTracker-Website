// Qibla Direction Class
export class QiblaDirection {
    constructor() {
        console.log('Initializing QiblaDirection...');
        this.container = document.getElementById('qiblaContent');
        if (!this.container) {
            console.error('Qibla container not found');
            return;
        }
        console.log('Qibla container found:', this.container);

        this.kaabaLocation = {
            latitude: 21.4225,
            longitude: 39.8262
        };
        
        this.currentLocation = null;
        this.qiblaDirection = null;
        this.isInitialized = false;
        
        // Initialize immediately
        this.initialize();
    }

    async initialize() {
        if (this.isInitialized) return;
        console.log('Starting initialization...');
        
        try {
            // Create compass container
            this.createCompassContainer();
            
            // Check if geolocation is supported
            if (!navigator.geolocation) {
                throw new Error('Geolocation is not supported by your browser');
            }

            // Get user's location
            console.log('Getting current position...');
            const position = await this.getCurrentPosition();
            this.currentLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            console.log('Current position:', this.currentLocation);
            
            // Get location name
            console.log('Getting location name...');
            await this.getLocationName();
            
            // Fetch Qibla direction
            console.log('Fetching Qibla direction...');
            await this.fetchQiblaDirection(this.currentLocation.latitude, this.currentLocation.longitude);
            
            // Start compass updates
            console.log('Starting compass updates...');
            this.startCompassUpdates();
            
            this.isInitialized = true;
            console.log('Initialization complete');
        } catch (error) {
            console.error('Error initializing Qibla direction:', error);
            this.showManualLocationInput();
        }
    }

    createCompassContainer() {
        console.log('Creating compass container...');
        this.container.innerHTML = `
            <div class="qibla-container">
                <div class="compass-container">
                    <div class="compass">
                        <div class="compass-rose"></div>
                        <div class="compass-needle"></div>
                        <div class="compass-direction"></div>
                    </div>
                    <div class="compass-info">
                        <h3>Qibla Direction</h3>
                        <p class="direction-text">Loading...</p>
                        <p class="distance-text"></p>
                        <p class="location-text"></p>
                    </div>
                </div>
                <div class="location-info">
                    <p>Your current location is required to show the Qibla direction.</p>
                    <button class="refresh-location">Refresh Location</button>
                </div>
            </div>
        `;

        // Add event listener for refresh button
        const refreshButton = this.container.querySelector('.refresh-location');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                console.log('Refresh button clicked');
                this.initialize();
            });
        }
    }

    async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        });
    }

    async getLocationName() {
        try {
            console.log('Fetching location name...');
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${this.currentLocation.latitude}&longitude=${this.currentLocation.longitude}`
            );
            const data = await response.json();
            this.currentLocation.name = `${data.city}, ${data.countryName}`;
            console.log('Location name:', this.currentLocation.name);
        } catch (error) {
            console.error('Error getting location name:', error);
            this.currentLocation.name = 'Unknown Location';
        }
    }

    async fetchQiblaDirection(latitude, longitude) {
        try {
            console.log('Fetching Qibla data...');
            // Use the correct API endpoint format with CORS headers
            const response = await fetch(`https://api.aladhan.com/v1/qibla/${latitude}/${longitude}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Qibla data received:', data);

            if (data.code === 200 && data.data) {
                this.updateQiblaInfo(data.data);
            } else {
                throw new Error('Invalid response from Qibla API');
            }
        } catch (error) {
            console.error('Error fetching Qibla direction:', error);
            this.showError('Unable to fetch Qibla direction data. Please try again.');
        }
    }

    updateQiblaInfo(qiblaData) {
        console.log('Updating Qibla info...');
        const directionText = this.container.querySelector('.direction-text');
        const distanceText = this.container.querySelector('.distance-text');
        const locationText = this.container.querySelector('.location-text');
        const compassNeedle = this.container.querySelector('.compass-needle');
        const compassDirection = this.container.querySelector('.compass-direction');

        if (!directionText || !distanceText || !locationText || !compassNeedle || !compassDirection) {
            console.error('Required elements not found');
            return;
        }

        // Update direction text
        const direction = parseFloat(qiblaData.direction);
        directionText.textContent = `Qibla Direction: ${direction.toFixed(2)}°`;

        // Update distance text
        const distance = parseFloat(qiblaData.distance);
        distanceText.textContent = `Distance to Kaaba: ${(distance / 1000).toFixed(2)} km`;

        // Update location text
        locationText.textContent = `Your Location: ${this.currentLocation.name}`;

        // Update compass needle
        compassNeedle.style.transform = `rotate(${direction}deg)`;
        
        // Update direction indicator
        compassDirection.textContent = this.getDirectionLabel(direction);
        console.log('Qibla info updated');
    }

    getDirectionLabel(degrees) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    }

    startCompassUpdates() {
        if (window.DeviceOrientationEvent) {
            console.log('Device orientation supported, starting compass updates');
            window.addEventListener('deviceorientation', (event) => {
                if (event.alpha !== null) {
                    const compass = this.container.querySelector('.compass');
                    if (compass) {
                        compass.style.transform = `rotate(${-event.alpha}deg)`;
                    }
                }
            });
        } else {
            console.log('Device orientation not supported');
        }
    }

    showError(message) {
        console.error('Showing error:', message);
        this.container.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button class="retry-button">Retry</button>
            </div>
        `;

        const retryButton = this.container.querySelector('.retry-button');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                console.log('Retry button clicked');
                this.initialize();
            });
        }
    }

    showManualLocationInput() {
        console.log('Showing manual location input...');
        this.container.innerHTML = `
            <div class="manual-location-input">
                <h3>Enter Your Location</h3>
                <p>Please enter your city or use the map to select your location:</p>
                <div class="location-input-container">
                    <input type="text" id="locationSearch" placeholder="Enter your city name..." class="location-input">
                    <button id="searchLocation" class="search-button">Search</button>
                </div>
                <div class="location-results" id="locationResults"></div>
                <div class="location-error" id="locationError"></div>
                <div class="location-actions">
                    <button class="retry-button">Try Automatic Location Again</button>
                </div>
            </div>
        `;

        // Add event listeners
        const searchButton = this.container.querySelector('#searchLocation');
        const locationInput = this.container.querySelector('#locationSearch');
        const retryButton = this.container.querySelector('.retry-button');

        if (searchButton && locationInput) {
            searchButton.addEventListener('click', () => this.searchLocation(locationInput.value));
            locationInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchLocation(locationInput.value);
                }
            });
        }

        if (retryButton) {
            retryButton.addEventListener('click', () => {
                console.log('Retrying automatic location...');
                this.initialize();
            });
        }
    }

    async searchLocation(query) {
        if (!query.trim()) return;

        const resultsContainer = this.container.querySelector('#locationResults');
        const errorContainer = this.container.querySelector('#locationError');
        
        try {
            // Use OpenStreetMap Nominatim API for geocoding with CORS headers
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`, {
                    headers: {
                        'Accept': 'application/json'
                    },
                    mode: 'cors'
                }
            );
            const data = await response.json();

            if (data && data.length > 0) {
                resultsContainer.innerHTML = data.slice(0, 5).map(place => `
                    <div class="location-result" data-lat="${place.lat}" data-lon="${place.lon}">
                        <span class="location-name">${place.display_name}</span>
                    </div>
                `).join('');

                // Add click handlers to results
                const results = resultsContainer.querySelectorAll('.location-result');
                results.forEach(result => {
                    result.addEventListener('click', () => {
                        const lat = parseFloat(result.dataset.lat);
                        const lon = parseFloat(result.dataset.lon);
                        this.useManualLocation(lat, lon, result.querySelector('.location-name').textContent);
                    });
                });

                errorContainer.textContent = '';
            } else {
                errorContainer.textContent = 'No locations found. Please try a different search term.';
                resultsContainer.innerHTML = '';
            }
        } catch (error) {
            console.error('Error searching location:', error);
            errorContainer.textContent = 'Error searching location. Please try again.';
            resultsContainer.innerHTML = '';
        }
    }

    async useManualLocation(latitude, longitude, locationName) {
        try {
            this.currentLocation = {
                latitude,
                longitude,
                name: locationName
            };

            // Fetch Qibla direction
            await this.fetchQiblaDirection(latitude, longitude);
            
            // Start compass updates
            this.startCompassUpdates();
            
            this.isInitialized = true;
        } catch (error) {
            console.error('Error using manual location:', error);
            this.showError('Error getting Qibla direction. Please try again.');
        }
    }
}

// Initialize Qibla direction when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, creating QiblaDirection...');
        new QiblaDirection();
    });
} else {
    console.log('DOM already loaded, creating QiblaDirection...');
    new QiblaDirection();
} 