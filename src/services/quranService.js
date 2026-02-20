/**
 * Quran Service
 * Fetches Quranic verses with translations from alquran.cloud API
 */

import { getDailyIndex } from '../utils/dateUtils.js';

// Total number of ayahs in the Quran
const TOTAL_AYAHS = 6236;

// A curated list of powerful, actionable ayahs for spiritual reminders
// These are selected for their brevity and impact
const CURATED_AYAHS = [
  1,     // Al-Fatiha 1:1 - Bismillah
  7,     // Al-Fatiha 1:7
  163,   // Al-Baqarah 2:156 - Inna lillahi wa inna ilayhi raji'un
  186,   // Al-Baqarah 2:186 - Allah answers prayers
  201,   // Al-Baqarah 2:201 - Rabbana atina
  255,   // Al-Baqarah 2:255 - Ayatul Kursi
  286,   // Al-Baqarah 2:286 - La yukallifullahu...
  8,     // Aal-Imran 3:8 - Rabbana la tuzigh
  139,   // Aal-Imran 3:139 - Do not be weak
  173,   // Aal-Imran 3:173 - Hasbunallah
  103,   // An-Nisa 4:103 - Prayer
  28,    // Al-Anfal 8:28 - Wealth and children are trial
  128,   // At-Tawbah 9:128 - Prophet's concern
  10,    // Yunus 10:10 - Alhamdulillah
  57,    // Yunus 10:57 - Quran as healing
  6,     // Hud 11:6 - Provision from Allah
  28,    // Ar-Ra'd 13:28 - Hearts find peace in remembrance
  7,     // Ibrahim 14:7 - Gratitude
  40,    // Ibrahim 14:40 - Rabbi j'alni  
  78,    // Al-Isra 17:78 - Establish prayer
  80,    // Al-Isra 17:80 - Rabbi adkhilni
  10,    // Al-Kahf 18:10 - Cave prayer
  24,    // Al-Kahf 18:24 - InshAllah
  46,    // Al-Kahf 18:46 - Good deeds
  114,   // Taha 20:114 - Rabbi zidni ilma
  35,    // Al-Anbiya 21:35 - Trial
  87,    // Al-Anbiya 21:87 - Yunus' dua
  77,    // Al-Hajj 22:77 - Ruku and Sujud
  115,   // Al-Mu'minun 23:115 - Purpose of creation
  55,    // Al-Furqan 25:55 - Ibadur Rahman
  74,    // Al-Furqan 25:74 - Family dua
  19,    // An-Naml 27:19 - Gratitude dua
  24,    // Al-Qasas 28:24 - Whatever you send
  26,    // Ar-Rum 30:26 - Devoutly obedient
  17,    // Luqman 31:17 - Patience
  41,    // Al-Ahzab 33:41 - Remember Allah much
  35,    // Fatir 35:35 - Paradise description
  82,    // Ya-Sin 36:82 - Kun fayakun
  53,    // Az-Zumar 39:53 - Never despair
  44,    // Fussilat 41:44 - Quran as healing
  19,    // Ash-Shura 42:19 - Allah is gentle
  13,    // Al-Hujurat 49:13 - Taqwa
  22,    // Adh-Dhariyat 51:22 - Provision in heaven
  21,    // Al-Hadid 57:21 - Race to forgiveness
  10,    // As-Saff 61:10 - Beneficial trade
  9,     // At-Taghabun 64:9 - Day of Assembly
  2,     // At-Talaq 65:2 - Taqwa
  3,     // At-Talaq 65:3 - Whoever trusts Allah
  8,     // At-Tahrim 66:8 - Sincere repentance
  12,    // Al-Mulk 67:12 - Those who fear unseen
  51,    // Al-Qalam 68:51 - Evil eye
  78,    // Al-Muzzammil 73:8 - Devote yourself wholly
  6,     // Al-Insan 76:6 - Spring in Paradise
  38,    // An-Naba 78:38 - Day of Standing
  15,    // Al-Fajr 89:15 - Human test
  4,     // Ash-Sharh 94:4 - Elevated mentions
  5,     // Ash-Sharh 94:5-6 - With hardship comes ease
  7,     // Al-'Alaq 96:7 - Human transgression
  5,     // Al-Qadr 97:5 - Laylatul Qadr
  7,     // Al-Bayyina 98:7 - Best of creatures
  2,     // At-Takathur 102:2 - Until visiting grave
  1,     // Al-'Asr 103:1-3 - Time and loss
  2,     // Al-Fil 105:2 - Foiled plots
  3,     // Al-Kafirun 109:3 - You have your religion
  1,     // Al-Ikhlas 112:1-4 - Tawheed
  1,     // Al-Falaq 113:1 - Seeking refuge
  1,     // An-Nas 114:1 - Seeking refuge
];

// Surah information for reference
const SURAH_NAMES = {
  1: 'Al-Fatiha', 2: 'Al-Baqarah', 3: "Aal-'Imran", 4: 'An-Nisa', 5: "Al-Ma'idah",
  6: "Al-An'am", 7: "Al-A'raf", 8: 'Al-Anfal', 9: 'At-Tawbah', 10: 'Yunus',
  11: 'Hud', 12: 'Yusuf', 13: "Ar-Ra'd", 14: 'Ibrahim', 15: 'Al-Hijr',
  16: 'An-Nahl', 17: "Al-Isra'", 18: 'Al-Kahf', 19: 'Maryam', 20: 'Taha',
  21: "Al-Anbiya'", 22: 'Al-Hajj', 23: "Al-Mu'minun", 24: 'An-Nur', 25: 'Al-Furqan',
  26: "Ash-Shu'ara'", 27: 'An-Naml', 28: 'Al-Qasas', 29: "Al-'Ankabut", 30: 'Ar-Rum',
  31: 'Luqman', 32: 'As-Sajdah', 33: 'Al-Ahzab', 34: "Saba'", 35: 'Fatir',
  36: 'Ya-Sin', 37: 'As-Saffat', 38: 'Sad', 39: 'Az-Zumar', 40: 'Ghafir',
  41: 'Fussilat', 42: 'Ash-Shura', 43: 'Az-Zukhruf', 44: 'Ad-Dukhan', 45: 'Al-Jathiyah',
  46: 'Al-Ahqaf', 47: 'Muhammad', 48: 'Al-Fath', 49: 'Al-Hujurat', 50: 'Qaf',
  51: 'Adh-Dhariyat', 52: 'At-Tur', 53: 'An-Najm', 54: 'Al-Qamar', 55: 'Ar-Rahman',
  56: "Al-Waqi'ah", 57: 'Al-Hadid', 58: 'Al-Mujadila', 59: 'Al-Hashr', 60: 'Al-Mumtahanah',
  61: 'As-Saff', 62: "Al-Jumu'ah", 63: 'Al-Munafiqun', 64: 'At-Taghabun', 65: 'At-Talaq',
  66: 'At-Tahrim', 67: 'Al-Mulk', 68: 'Al-Qalam', 69: 'Al-Haqqah', 70: "Al-Ma'arij",
  71: 'Nuh', 72: 'Al-Jinn', 73: 'Al-Muzzammil', 74: 'Al-Muddaththir', 75: 'Al-Qiyamah',
  76: 'Al-Insan', 77: 'Al-Mursalat', 78: "An-Naba'", 79: "An-Nazi'at", 80: "'Abasa",
  81: 'At-Takwir', 82: 'Al-Infitar', 83: 'Al-Mutaffifin', 84: 'Al-Inshiqaq', 85: 'Al-Buruj',
  86: 'At-Tariq', 87: "Al-A'la", 88: 'Al-Ghashiyah', 89: 'Al-Fajr', 90: 'Al-Balad',
  91: 'Ash-Shams', 92: 'Al-Layl', 93: 'Ad-Duhaa', 94: 'Ash-Sharh', 95: 'At-Tin',
  96: "Al-'Alaq", 97: 'Al-Qadr', 98: 'Al-Bayyinah', 99: 'Az-Zalzalah', 100: "Al-'Adiyat",
  101: "Al-Qari'ah", 102: 'At-Takathur', 103: "Al-'Asr", 104: 'Al-Humazah', 105: 'Al-Fil',
  106: 'Quraysh', 107: "Al-Ma'un", 108: 'Al-Kawthar', 109: 'Al-Kafirun', 110: 'An-Nasr',
  111: 'Al-Masad', 112: 'Al-Ikhlas', 113: 'Al-Falaq', 114: 'An-Nas'
};

/**
 * Get ayah number to fetch for today
 * Uses the curated list for better content selection
 * @returns {number}
 */
function getTodaysAyahNumber() {
  const index = getDailyIndex() % CURATED_AYAHS.length;
  return CURATED_AYAHS[index];
}

/**
 * Fetch a Quranic verse with translations
 * @param {number} ayahNumber - The ayah number (1-6236)
 * @returns {Promise<Object>} Ayah data with translations
 */
export async function fetchAyah(ayahNumber = null) {
  const ayah = ayahNumber || getTodaysAyahNumber();
  
  try {
    // Fetch from alquran.cloud API with multiple editions
    // quran-uthmani: Arabic Uthmani script
    // en.sahih: English Sahih International
    // ur.maududi: Urdu Maududi translation
    const url = `https://api.alquran.cloud/v1/ayah/${ayah}/editions/quran-uthmani,en.sahih,ur.maududi`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 200 || !data.data) {
      throw new Error('Invalid API response');
    }

    // Parse the response - data.data is an array of editions
    const [arabic, english, urdu] = data.data;

    // Format the reference
    const surahNumber = arabic.surah.number;
    const surahName = SURAH_NAMES[surahNumber] || arabic.surah.englishName;
    const ayahInSurah = arabic.numberInSurah;

    return {
      id: `quran_${ayah}`,
      type: 'quran',
      arabic: arabic.text,
      english: english.text,
      urdu: urdu.text,
      reference: `${surahName} ${surahNumber}:${ayahInSurah}`,
      title: generateTitle(arabic.surah.englishName, ayahInSurah)
    };

  } catch (error) {
    console.error('Quran API error:', error);
    throw error;
  }
}

/**
 * Generate a short actionable title based on surah
 * @param {string} surahName 
 * @param {number} ayah 
 * @returns {string}
 */
function generateTitle(surahName, ayah) {
  // Map of known powerful verses to meaningful titles
  const titles = {
    'Al-Faatiha': 'Open your heart with gratitude',
    'Al-Baqara': 'Reflect on guidance',
    'Aal-i-Imraan': 'Strengthen your faith',
    'An-Nisaa': 'Practice justice',
    'Al-Maeda': 'Honor your commitments',
    'Al-Anfaal': 'Trust in Allah\'s plan',
    'At-Tawba': 'Seek sincere repentance',
    'Yunus': 'Remember Allah\'s mercy',
    'Hud': 'Stay steadfast',
    'Ar-Rad': 'Find peace in remembrance',
    'Ibrahim': 'Express gratitude',
    'Al-Israa': 'Honor your parents',
    'Al-Kahf': 'Seek protection from trials',
    'Taa-Haa': 'Increase in knowledge',
    'Al-Anbiyaa': 'Call upon Allah',
    'Al-Hajj': 'Bow down in devotion',
    'Al-Muminoon': 'Reflect on purpose',
    'Al-Furqaan': 'Walk humbly',
    'Luqman': 'Practice patience',
    'Al-Ahzaab': 'Remember Allah often',
    'Yaseen': 'Trust Allah\'s power',
    'Az-Zumar': 'Never lose hope',
    'Al-Hujuraat': 'Build taqwa',
    'Al-Mulk': 'Fear Allah in private',
    'Al-Muzzammil': 'Devote yourself to worship',
    'Al-Ikhlaas': 'Affirm His Oneness',
    'Al-Falaq': 'Seek refuge in Allah',
    'An-Naas': 'Protect from whispers'
  };

  return titles[surahName] || 'Reflect on this verse';
}

/**
 * Get today's Quran reminder
 * @returns {Promise<Object>}
 */
export async function getTodaysQuranReminder() {
  return await fetchAyah();
}
