// Fawaz Ahmed Hadith API
const ENGLISH_API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-';
const ARABIC_API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-';

class HadithsList {
    constructor() {
        this.hadithsList = document.getElementById('hadithsList');
        this.hadithSearch = document.getElementById('hadithSearch');
        this.collectionTitle = document.getElementById('collectionTitle');
        this.prevPageBtn = document.getElementById('prevPage');
        this.nextPageBtn = document.getElementById('nextPage');
        this.pageInfo = document.getElementById('pageInfo');
        
        this.currentCollection = this.getCollectionFromUrl();
        this.currentPage = 1;
        this.hadithsPerPage = 10;
        this.totalPages = 1;
        this.hadiths = [];
        
        this.initializeEventListeners();
        this.loadHadiths();
    }
    
    getCollectionFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('collection') || 'bukhari';
    }
    
    initializeEventListeners() {
        // Search functionality
        this.hadithSearch.addEventListener('input', this.debounce(() => {
            this.currentPage = 1;
            this.renderHadithsList();
        }, 500));
        // Pagination
        this.prevPageBtn.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderHadithsList();
            }
        });
        this.nextPageBtn.addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.renderHadithsList();
            }
        });
        // Event delegation for 'Read Full' button
        this.hadithsList.addEventListener('click', (e) => {
            const target = e.target.closest('.btn-read');
            if (target) {
                e.preventDefault();
                const url = target.getAttribute('href');
                if (url) {
                    window.location.href = url;
                }
            }
        });
    }
    
    async loadHadiths() {
        try {
            this.showLoading();
            const [engRes, araRes] = await Promise.all([
                fetch(`${ENGLISH_API_BASE}${this.currentCollection}.json`),
                fetch(`${ARABIC_API_BASE}${this.currentCollection}.json`)
            ]);
            const engData = await engRes.json();
            const araData = await araRes.json();
            // Merge by hadith number
            const engHadiths = engData.hadiths || [];
            const araHadiths = araData.hadiths || [];
            const merged = engHadiths.map((eng, i) => ({
                number: eng.number,
                eng: eng.text,
                ara: araHadiths[i] ? araHadiths[i].text : ''
            }));
            this.hadiths = merged;
            this.totalPages = Math.ceil(this.hadiths.length / this.hadithsPerPage);
            this.updatePagination();
            this.updateCollectionTitle();
            this.renderHadithsList();
        } catch (error) {
            console.error('Error loading hadiths:', error);
            this.showError('Failed to load hadiths. Please try again later.');
        }
    }
    
    updatePagination() {
        this.pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
        this.prevPageBtn.disabled = this.currentPage === 1;
        this.nextPageBtn.disabled = this.currentPage === this.totalPages;
    }
    
    updateCollectionTitle() {
        this.collectionTitle.textContent = this.getCollectionName(this.currentCollection);
    }
    
    renderHadithsList() {
        const searchQuery = this.hadithSearch.value.trim().toLowerCase();
        let filtered = this.hadiths;
        if (searchQuery) {
            filtered = filtered.filter(h =>
                (h.eng && h.eng.toLowerCase().includes(searchQuery)) ||
                (h.ara && h.ara.toLowerCase().includes(searchQuery))
            );
        }
        this.totalPages = Math.ceil(filtered.length / this.hadithsPerPage) || 1;
        this.updatePagination();
        const start = (this.currentPage - 1) * this.hadithsPerPage;
        const end = start + this.hadithsPerPage;
        const pageHadiths = filtered.slice(start, end);
        this.hadithsList.innerHTML = '';
        if (pageHadiths.length === 0) {
            this.hadithsList.innerHTML = '<div class="no-hadiths">No hadiths found</div>';
            return;
        }
        pageHadiths.forEach((hadith, idx) => {
            // Debug: log hadith object
            console.log('Rendering hadith:', hadith);
            // Fallback: use idx+start+1 if hadith.number is missing
            const hadithNumber = hadith.number !== undefined && hadith.number !== null ? hadith.number : (start + idx + 1);
            const hadithElement = document.createElement('div');
            hadithElement.className = 'hadith-item';
            hadithElement.innerHTML = `
                <div class="hadith-header">
                    <span class="hadith-number">Hadith #${hadithNumber}</span>
                </div>
                <div class="hadith-arabic-line">${hadith.ara}</div>
                <div class="hadith-translation-line">${hadith.eng}</div>
                <div class="hadith-actions">
                    <a href="hadith-reader.html?collection=${this.currentCollection}&hadith=${hadithNumber}" class="btn-read">
                        <i class="fas fa-book-open"></i> Read Full
                    </a>
                </div>
            `;
            this.hadithsList.appendChild(hadithElement);
        });
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
    
    showLoading() {
        this.hadithsList.innerHTML = `<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading hadiths...</div>`;
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

document.addEventListener('DOMContentLoaded', () => {
    new HadithsList();
}); 