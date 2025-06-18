// Quran Tracking

class QuranService {
    static BASE_URL = 'https://api.alquran.cloud/v1';

    static async getSurahs() {
        try {
            const response = await fetch(`${this.BASE_URL}/surah`);
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching surahs:', error);
            throw error;
        }
    }

    static async getSurahDetail(surahNumber) {
        try {
            const response = await fetch(
                `${this.BASE_URL}/surah/${surahNumber}/editions/quran-uthmani,en.asad,bn.bengali`
            );
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching surah details:', error);
            throw error;
        }
    }

    static async search(query) {
        try {
            const response = await fetch(
                `${this.BASE_URL}/search/${query}/all/en.asad,bn.bengali`
            );
            const data = await response.json();
            return data.data?.matches || [];
        } catch (error) {
            console.error('Error searching Quran:', error);
            throw error;
        }
    }

    static async getAudioUrl(number, isJuz = false) {
        if (isJuz) {
            return `https://cdn.islamic.network/quran/sounds/128/ar.alafasy/${number}.mp3`;
        }
        return `https://cdn.islamic.network/quran/sounds-surah/128/ar.alafasy/${number}.mp3`;
    }
}

// Initialize Quran functionality
document.addEventListener('DOMContentLoaded', async () => {
    const surahList = document.getElementById('surahList');
    const quranSearch = document.getElementById('quranSearch');
    const quranEdition = document.getElementById('quranEdition');

    if (!surahList || !quranSearch || !quranEdition) {
        console.error('Required Quran elements not found');
        return;
    }

    // Load surahs
    try {
        const surahs = await QuranService.getSurahs();
        surahList.innerHTML = surahs.map(surah => `
            <a class="surah-item" href="quran-reader.html?surah=${surah.number}">
                <div class="surah-number">${surah.number}</div>
                <div class="surah-info">
                    <h3>${surah.name}</h3>
                    <p>${surah.englishName} - ${surah.englishNameTranslation}</p>
                </div>
                <div class="surah-details">
                    <span>${surah.numberOfAyahs} Verses</span>
                    <span>${surah.revelationType}</span>
                </div>
            </a>
        `).join('');
    } catch (error) {
        console.error('Error loading surahs:', error);
        surahList.innerHTML = '<p class="error">Failed to load surahs. Please try again later.</p>';
    }

    // Search functionality
    let searchTimeout;
    quranSearch.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            const query = e.target.value.trim();
            if (query.length < 2) {
                // Show all surahs if search is cleared
                document.querySelectorAll('.surah-item').forEach(item => item.style.display = '');
                return;
            }
            document.querySelectorAll('.surah-item').forEach(item => {
                const name = item.querySelector('h3').textContent.toLowerCase();
                const englishName = item.querySelector('p').textContent.toLowerCase();
                const isVisible = name.includes(query.toLowerCase()) || englishName.includes(query.toLowerCase());
                item.style.display = isVisible ? '' : 'none';
            });
        }, 300);
    });

    // Edition change handler (optional: could reload surah list with different edition info)
    // Currently does nothing, as edition is handled in the reader page.
});

// No displaySurahDetail or displaySearchResults here, as surah content is not shown below the list anymore.
function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
} 