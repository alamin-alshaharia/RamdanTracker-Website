// Fawaz Ahmed Hadith API
const ENGLISH_API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-';
const ARABIC_API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-';

class HadithReader {
    constructor() {
        this.hadithText = document.getElementById('hadithText');
        this.hadithTitle = document.getElementById('hadithTitle');
        this.backButton = document.getElementById('backButton');
        this.prevHadithBtn = document.getElementById('prevHadith');
        this.nextHadithBtn = document.getElementById('nextHadith');
        this.shareHadithBtn = document.getElementById('shareHadith');
        
        this.currentCollection = this.getCollectionFromUrl();
        this.currentHadithNumber = parseInt(this.getHadithNumberFromUrl());
        this.currentHadith = null;
        
        this.initializeEventListeners();
        this.loadHadith();
    }
    
    getCollectionFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('collection') || 'bukhari';
    }
    
    getHadithNumberFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('hadith') || '1';
    }
    
    initializeEventListeners() {
        // Back button
        this.backButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `hadiths-list.html?collection=${this.currentCollection}`;
        });
        
        // Navigation buttons
        this.prevHadithBtn.addEventListener('click', () => {
            if (this.currentHadithNumber > 1) {
                this.currentHadithNumber--;
                this.updateUrl();
                this.loadHadith();
            }
        });
        
        this.nextHadithBtn.addEventListener('click', () => {
            this.currentHadithNumber++;
            this.updateUrl();
            this.loadHadith();
        });
        
        // Share button
        this.shareHadithBtn.addEventListener('click', () => {
            this.shareHadith();
        });
    }
    
    updateUrl() {
        const newUrl = `hadith-reader.html?collection=${this.currentCollection}&hadith=${this.currentHadithNumber}`;
        window.history.pushState({}, '', newUrl);
    }
    
    async loadHadith() {
        try {
            this.showLoading();
            const [engRes, araRes] = await Promise.all([
                fetch(`${ENGLISH_API_BASE}${this.currentCollection}/${this.currentHadithNumber}.json`),
                fetch(`${ARABIC_API_BASE}${this.currentCollection}/${this.currentHadithNumber}.json`)
            ]);
            if (!engRes.ok && !araRes.ok) {
                this.showError('Hadith not found. Please try another hadith number.');
                return;
            }
            let engData = {};
            let araData = {};
            try { engData = await engRes.json(); } catch {}
            try { araData = await araRes.json(); } catch {}
            // Check if hadith exists in either language
            const engText = engData.hadith && engData.hadith.text ? engData.hadith.text : '';
            const araText = araData.hadith && araData.hadith.text ? araData.hadith.text : '';
            if (!engText && !araText) {
                this.showError('Hadith not found. Please try another hadith number.');
                return;
            }
            this.currentHadith = {
                number: this.currentHadithNumber,
                eng: engText,
                ara: araText
            };
            this.renderHadith();
            this.updateNavigationButtons();
        } catch (error) {
            console.error('Error loading hadith:', error);
            this.showError('Failed to load hadith. Please try again later.');
        }
    }
    
    renderHadith() {
        this.hadithTitle.textContent = `${this.getCollectionName(this.currentCollection)} - Hadith #${this.currentHadith.number}`;
        this.hadithText.innerHTML = `
            <div class="hadith-full improved-hadith-display">
                ${this.currentHadith.ara ? `<div class="hadith-arabic-line">${this.currentHadith.ara}</div>` : ''}
                ${this.currentHadith.eng ? `<div class="hadith-translation-line">${this.currentHadith.eng}</div>` : ''}
            </div>
        `;
    }
    
    updateNavigationButtons() {
        this.prevHadithBtn.disabled = this.currentHadithNumber <= 1;
        this.nextHadithBtn.disabled = false;
    }
    
    shareHadith() {
        if (!this.currentHadith) return;
        const text = `Hadith #${this.currentHadith.number}\n\n${this.currentHadith.eng}\n\nShared from Ramadan Tracker`;
        if (navigator.share) {
            navigator.share({
                title: `Hadith #${this.currentHadith.number}`,
                text: text
            }).catch(console.error);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
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
    
    showLoading() {
        this.hadithText.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading hadith...</p>
            </div>
        `;
    }
    
    showError(message) {
        this.hadithText.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

// Initialize hadith reader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const hadithReader = new HadithReader();
});

// Add improved display styles (optional, for clarity)
const style = document.createElement('style');
style.innerHTML = `
.improved-hadith-display {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 16px rgba(33,150,243,0.08);
    padding: 2rem 1.5rem;
    margin: 1.5rem 0;
    font-family: 'Poppins', sans-serif;
}
.hadith-arabic-line {
    font-size: 1.5rem;
    color: #222;
    font-weight: 500;
    direction: rtl;
    text-align: right;
    margin-bottom: 12px;
}
.hadith-translation-line {
    font-size: 1.1rem;
    color: #444;
    margin-bottom: 10px;
    text-align: left;
    direction: ltr;
}
.hadith-grade {
    font-size: 0.98rem;
    color: #888;
    margin-top: 8px;
    font-style: italic;
}
`;
document.head.appendChild(style); 