// Quran Reader Page Logic

const API_BASE = 'https://api.alquran.cloud/v1';
const AUDIO_BASE = 'https://cdn.islamic.network/quran/audio/128/ar.alafasy';

const urlParams = new URLSearchParams(window.location.search);
let surahNumber = parseInt(urlParams.get('surah')) || 1;
let showTranslation = false;

const surahTitle = document.getElementById('surahTitle');
const surahMeta = document.getElementById('surahMeta');
const ayahList = document.getElementById('ayahList');
const toggleTranslationBtn = document.getElementById('toggleTranslation');
const prevSurahBtn = document.getElementById('prevSurah');
const nextSurahBtn = document.getElementById('nextSurah');

async function fetchSurah(number) {
    // Uthmani (Arabic) and English translation
    const url = `${API_BASE}/surah/${number}/editions/quran-uthmani,en.asad`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.data || data.data.length < 2) throw new Error('Surah not found');
    return {
        arabic: data.data[0],
        translation: data.data[1]
    };
}

function renderSurah(surah) {
    surahTitle.textContent = `${surah.arabic.englishName} (${surah.arabic.name})`;
    surahMeta.innerHTML = `${surah.arabic.englishNameTranslation} &bull; ${surah.arabic.revelationType} &bull; ${surah.arabic.numberOfAyahs} Ayahs`;
    ayahList.innerHTML = '';
    surah.arabic.ayahs.forEach((ayah, idx) => {
        const row = document.createElement('div');
        row.className = 'ayah-row';

        // Play button
        const controls = document.createElement('div');
        controls.className = 'ayah-controls';
        const playBtn = document.createElement('button');
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.title = 'Play Ayah';
        playBtn.onclick = () => playAyahAudio(surahNumber, ayah.numberInSurah);
        controls.appendChild(playBtn);

        // Arabic
        const arabic = document.createElement('div');
        arabic.className = 'ayah-arabic';
        arabic.textContent = ayah.text;

        // Translation
        const translation = document.createElement('div');
        translation.className = 'ayah-translation';
        translation.textContent = surah.translation.ayahs[idx]?.text || '';
        if (showTranslation) translation.style.display = 'block';

        // Ayah number badge
        const badge = document.createElement('div');
        badge.className = 'ayah-badge';
        badge.textContent = ayah.numberInSurah;

        row.appendChild(controls);
        row.appendChild(arabic);
        row.appendChild(translation);
        row.appendChild(badge);
        ayahList.appendChild(row);
    });
}

function playAyahAudio(surah, ayah) {
    // Alafasy audio: https://cdn.islamic.network/quran/audio/128/ar.alafasy/{surah}{ayah}.mp3
    // Format: surah and ayah are 3 digits, e.g. 001001.mp3
    const surahStr = surah.toString().padStart(3, '0');
    const ayahStr = ayah.toString().padStart(3, '0');
    const audioUrl = `${AUDIO_BASE}/${surahStr}${ayahStr}.mp3`;
    const audio = new Audio(audioUrl);
    audio.play();
}

toggleTranslationBtn.onclick = () => {
    showTranslation = !showTranslation;
    const span = toggleTranslationBtn.querySelector('span');
    span.textContent = showTranslation ? 'Hide Translation' : 'Show Translation';
    toggleTranslationBtn.classList.toggle('active', showTranslation);
    document.querySelectorAll('.ayah-translation').forEach(el => {
        el.style.display = showTranslation ? 'block' : 'none';
    });
};

prevSurahBtn.onclick = () => {
    if (surahNumber > 1) {
        window.location.href = `quran-reader.html?surah=${surahNumber - 1}`;
    }
};

nextSurahBtn.onclick = () => {
    if (surahNumber < 114) {
        window.location.href = `quran-reader.html?surah=${surahNumber + 1}`;
    }
};

// Initial load
(async function() {
    try {
        const surah = await fetchSurah(surahNumber);
        renderSurah(surah);
    } catch (e) {
        ayahList.innerHTML = '<p class="error">Failed to load surah.</p>';
    }
})(); 