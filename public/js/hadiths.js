// Hadith API
const HADITH_API_URL = 'https://api.hadith.gq/v1/hadiths';

class HadithReader {
    constructor() {
        this.hadithsList = document.getElementById('hadithsList');
        this.hadithReader = document.getElementById('hadithReader');
        this.hadithSearch = document.getElementById('hadithSearch');
        this.hadithCollection = document.getElementById('hadithCollection');
        
        this.currentCollection = 'bukhari';
        this.currentPage = 1;
        this.hadithsPerPage = 10;
        
        this.initializeEventListeners();
        this.loadHadiths();
    }
    
    initializeEventListeners() {
        // Collection change
        this.hadithCollection.addEventListener('change', (e) => {
            this.currentCollection = e.target.value;
            this.currentPage = 1;
            this.loadHadiths();
        });
        
        // Search functionality
        this.hadithSearch.addEventListener('input', this.debounce(() => {
            this.currentPage = 1;
            this.loadHadiths();
        }, 500));
    }
    
    async loadHadiths() {
        try {
            const searchQuery = this.hadithSearch.value.trim();
            const response = await fetch(`${HADITH_API_URL}/${this.currentCollection}?page=${this.currentPage}&limit=${this.hadithsPerPage}${searchQuery ? `&query=${encodeURIComponent(searchQuery)}` : ''}`);
            const data = await response.json();
            
            if (data.code === 200 && data.data) {
                this.renderHadithsList(data.data);
            } else {
                throw new Error('Failed to fetch hadiths');
            }
        } catch (error) {
            console.error('Error loading hadiths:', error);
            this.showError('Failed to load hadiths. Please try again later.');
        }
    }
    
    renderHadithsList(hadiths) {
        this.hadithsList.innerHTML = '';
        
        if (hadiths.length === 0) {
            this.hadithsList.innerHTML = '<div class="no-hadiths">No hadiths found</div>';
            return;
        }
        
        hadiths.forEach(hadith => {
            const hadithElement = document.createElement('div');
            hadithElement.className = 'hadith-item';
            hadithElement.innerHTML = `
                <div class="hadith-header">
                    <span class="hadith-number">Hadith #${hadith.hadithnumber}</span>
                    <span class="hadith-book">${this.getCollectionName(this.currentCollection)}</span>
                </div>
                <div class="hadith-text">${hadith.text}</div>
                <div class="hadith-actions">
                    <button class="btn-read" data-hadith-id="${hadith.hadithnumber}">
                        <i class="fas fa-book-open"></i> Read Full
                    </button>
                    <button class="btn-share" data-hadith-id="${hadith.hadithnumber}">
                        <i class="fas fa-share"></i> Share
                    </button>
                </div>
            `;
            
            // Add click event for reading full hadith
            hadithElement.querySelector('.btn-read').addEventListener('click', () => {
                this.showFullHadith(hadith);
            });
            
            // Add click event for sharing
            hadithElement.querySelector('.btn-share').addEventListener('click', () => {
                this.shareHadith(hadith);
            });
            
            this.hadithsList.appendChild(hadithElement);
        });
    }
    
    showFullHadith(hadith) {
        this.hadithReader.innerHTML = `
            <div class="hadith-full">
                <div class="hadith-full-header">
                    <h3>${this.getCollectionName(this.currentCollection)}</h3>
                    <span class="hadith-number">Hadith #${hadith.hadithnumber}</span>
                </div>
                <div class="hadith-full-content">
                    <div class="arabic-text">${hadith.arabic || ''}</div>
                    <div class="english-text">${hadith.text}</div>
                    ${hadith.grade ? `<div class="hadith-grade">Grade: ${hadith.grade}</div>` : ''}
                </div>
                <div class="hadith-full-actions">
                    <button class="btn-close">
                        <i class="fas fa-times"></i> Close
                    </button>
                    <button class="btn-share">
                        <i class="fas fa-share"></i> Share
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners
        this.hadithReader.querySelector('.btn-close').addEventListener('click', () => {
            this.hadithReader.innerHTML = '';
        });
        
        this.hadithReader.querySelector('.btn-share').addEventListener('click', () => {
            this.shareHadith(hadith);
        });
        
        // Show the reader
        this.hadithReader.style.display = 'block';
    }
    
    shareHadith(hadith) {
        const text = `Hadith from ${this.getCollectionName(this.currentCollection)}:\n\n${hadith.text}\n\nShared from Ramadan Tracker`;
        
        if (navigator.share) {
            navigator.share({
                title: `Hadith #${hadith.hadithnumber}`,
                text: text
            }).catch(console.error);
        } else {
            // Fallback for browsers that don't support Web Share API
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            // Show copied message
            const message = document.createElement('div');
            message.className = 'copy-message';
            message.textContent = 'Hadith copied to clipboard!';
            document.body.appendChild(message);
            setTimeout(() => message.remove(), 2000);
        }
    }
    
    getCollectionName(collection) {
        const collections = {
            bukhari: 'Sahih Bukhari',
            muslim: 'Sahih Muslim',
            abudawud: 'Abu Dawud',
            tirmidhi: 'Tirmidhi',
            nasai: 'Nasai',
            ibnmajah: 'Ibn Majah'
        };
        return collections[collection] || collection;
    }
    
    showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        `;
        this.hadithsList.innerHTML = '';
        this.hadithsList.appendChild(errorElement);
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize hadith reader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const hadithReader = new HadithReader();
});

// Add styles
const style = document.createElement('style');
style.textContent = `
    .hadiths-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }
    
    .hadiths-search {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
    }
    
    .hadiths-search input {
        flex: 1;
        padding: 0.8rem;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1rem;
    }
    
    .hadiths-search select {
        padding: 0.8rem;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1rem;
        background-color: white;
    }
    
    .hadith-item {
        background-color: var(--card-bg);
        border-radius: 10px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        box-shadow: var(--shadow);
    }
    
    .hadith-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
    }
    
    .hadith-number {
        color: var(--primary-color);
        font-weight: 500;
    }
    
    .hadith-book {
        color: var(--secondary-color);
    }
    
    .hadith-text {
        margin-bottom: 1rem;
        line-height: 1.6;
    }
    
    .hadith-actions {
        display: flex;
        gap: 1rem;
    }
    
    .btn-read,
    .btn-share {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: var(--transition);
    }
    
    .btn-read {
        background-color: var(--primary-color);
        color: white;
    }
    
    .btn-share {
        background-color: transparent;
        border: 1px solid var(--primary-color);
        color: var(--primary-color);
    }
    
    .hadith-reader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .hadith-full {
        background-color: var(--card-bg);
        border-radius: 10px;
        padding: 2rem;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    .hadith-full-header {
        margin-bottom: 1.5rem;
    }
    
    .hadith-full-content {
        margin-bottom: 1.5rem;
    }
    
    .arabic-text {
        font-size: 1.2rem;
        margin-bottom: 1rem;
        text-align: right;
        direction: rtl;
    }
    
    .english-text {
        line-height: 1.6;
    }
    
    .hadith-grade {
        margin-top: 1rem;
        color: var(--primary-color);
        font-weight: 500;
    }
    
    .hadith-full-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }
    
    .btn-close {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        background-color: #dc3545;
        color: white;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .copy-message {
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--primary-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        animation: fadeInOut 2s ease-in-out;
    }
    
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, 20px); }
        20% { opacity: 1; transform: translate(-50%, 0); }
        80% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -20px); }
    }
    
    @media (max-width: 768px) {
        .hadiths-search {
            flex-direction: column;
        }
        
        .hadith-actions {
            flex-direction: column;
        }
        
        .hadith-full {
            width: 95%;
            padding: 1rem;
        }
    }
`;
document.head.appendChild(style); 