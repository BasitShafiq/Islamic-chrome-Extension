/**
 * Quran Service
 * Fetches Quranic verses with translations from alquran.cloud API
 */

import { getDailyIndex } from '../utils/dateUtils.js';

// Total number of ayahs in the Quran
const TOTAL_AYAHS = 6236;

// An expanded curated list of powerful, actionable ayahs for spiritual reminders
// These are selected for their brevity, impact, and spiritual significance
const CURATED_AYAHS = [
  // Al-Fatiha - The Opening
  1,     // Al-Fatiha 1:1 - Bismillah
  7,     // Al-Fatiha 1:7
  
  // Al-Baqarah - The Cow
  163,   // Al-Baqarah 2:152 - Remember Me, I will remember you
  186,   // Al-Baqarah 2:186 - Allah answers prayers (I am near)
  201,   // Al-Baqarah 2:201 - Rabbana atina fid-dunya
  255,   // Al-Baqarah 2:255 - Ayatul Kursi
  286,   // Al-Baqarah 2:286 - Allah does not burden a soul beyond capacity
  153,   // Al-Baqarah 2:153 - Seek help through patience and prayer
  185,   // Al-Baqarah 2:185 - Month of Ramadan
  
  // Aal-Imran - Family of Imran
  8,     // Aal-Imran 3:8 - Rabbana la tuzigh qulubana
  139,   // Aal-Imran 3:139 - Do not weaken, do not grieve
  173,   // Aal-Imran 3:173 - Hasbunallah wa ni'mal wakeel
  159,   // Aal-Imran 3:159 - Trust in Allah
  200,   // Aal-Imran 3:200 - Be patient and persevere
  
  // An-Nisa - The Women
  36,    // An-Nisa 4:36 - Worship Allah alone
  79,    // An-Nisa 4:79 - Whatever good comes to you is from Allah
  
  // Al-Ma'idah - The Table Spread
  2,     // Al-Ma'idah 5:2 - Cooperate in righteousness
  
  // Al-An'am - The Cattle
  162,   // Al-An'am 6:162 - Say: My prayer and sacrifice are for Allah
  
  // Al-A'raf - The Heights
  55,    // Al-A'raf 7:55 - Call upon your Lord humbly
  56,    // Al-A'raf 7:56 - The mercy of Allah is near
  
  // Al-Anfal - The Spoils of War
  28,    // Al-Anfal 8:28 - Wealth and children are a trial
  
  // At-Tawbah - The Repentance
  128,   // At-Tawbah 9:128 - Prophet's concern for believers
  129,   // At-Tawbah 9:129 - Allah is sufficient for me
  
  // Yunus - Jonah
  10,    // Yunus 10:10 - Their call will be SubhanakAllahumma
  57,    // Yunus 10:57 - Quran as healing for hearts
  62,    // Yunus 10:62 - No fear for friends of Allah
  
  // Hud - Hud
  6,     // Hud 11:6 - No creature without Allah's provision
  
  // Yusuf - Joseph
  86,    // Yusuf 12:86 - I only complain to Allah
  87,    // Yusuf 12:87 - Never despair of Allah's mercy
  
  // Ar-Ra'd - The Thunder
  28,    // Ar-Ra'd 13:28 - Hearts find peace in remembrance of Allah
  11,    // Ar-Ra'd 13:11 - Allah will not change a people until they change themselves
  
  // Ibrahim - Abraham
  7,     // Ibrahim 14:7 - If you are grateful, I will increase you
  40,    // Ibrahim 14:40 - Rabbi j'alni muqimas salat
  41,    // Ibrahim 14:41 - Rabbana-ghfirli
  
  // Al-Hijr - The Rocky Tract
  9,     // Al-Hijr 15:9 - We have sent down the reminder and will guard it
  
  // An-Nahl - The Bee
  97,    // An-Nahl 16:97 - Whoever does good, will live a good life
  125,   // An-Nahl 16:125 - Invite to the way of your Lord with wisdom
  
  // Al-Isra - The Night Journey
  78,    // Al-Isra 17:78 - Establish prayer at the decline of the sun
  80,    // Al-Isra 17:80 - Rabbi adkhilni mudkhala sidqin
  82,    // Al-Isra 17:82 - Quran is healing and mercy
  23,    // Al-Isra 17:23 - Be kind to parents
  
  // Al-Kahf - The Cave
  10,    // Al-Kahf 18:10 - Youth in the cave dua
  24,    // Al-Kahf 18:24 - Say InshAllah
  39,    // Al-Kahf 18:39 - What Allah willed (MashAllah)
  46,    // Al-Kahf 18:46 - Good deeds are best with Allah
  109,   // Al-Kahf 18:109 - If the sea were ink for Allah's words
  110,   // Al-Kahf 18:110 - Whoever hopes to meet their Lord
  
  // Maryam - Mary
  96,    // Maryam 19:96 - Those who believe, Allah grants them love
  
  // Taha - Ta-Ha
  114,   // Taha 20:114 - Rabbi zidni ilma (O Lord, increase me in knowledge)
  
  // Al-Anbiya - The Prophets
  35,    // Al-Anbiya 21:35 - Every soul will taste death
  87,    // Al-Anbiya 21:87 - La ilaha illa anta subhanaka (Yunus' dua)
  89,    // Al-Anbiya 21:89 - Rabbi la tadharnee fardan (Zakariya's dua)
  
  // Al-Hajj - The Pilgrimage
  77,    // Al-Hajj 22:77 - O believers, bow down and prostrate
  78,    // Al-Hajj 22:78 - Strive for Allah as He deserves
  
  // Al-Mu'minun - The Believers
  1,     // Al-Mu'minun 23:1 - Successful are the believers
  115,   // Al-Mu'minun 23:115 - Did you think We created you in vain?
  
  // An-Nur - The Light
  35,    // An-Nur 24:35 - Allah is the Light of the heavens and earth
  
  // Al-Furqan - The Criterion
  55,    // Al-Furqan 25:55-58 - Description of Ibadur Rahman
  63,    // Al-Furqan 25:63 - Servants who walk humbly
  74,    // Al-Furqan 25:74 - Grant us from our spouses comfort
  75,    // Al-Furqan 25:75 - They will be rewarded with the highest place
  
  // Ash-Shu'ara - The Poets
  80,    // Ash-Shu'ara 26:80 - When I am ill, He heals me
  
  // An-Naml - The Ant
  19,    // An-Naml 27:19 - Rabbi awzi'ni (Prayer for gratitude)
  62,    // An-Naml 27:62 - Who responds to the desperate one?
  
  // Al-Qasas - The Stories
  24,    // Al-Qasas 28:24 - I am in need of whatever good You send me
  77,    // Al-Qasas 28:77 - Seek the Hereafter with what Allah gave you
  
  // Al-Ankabut - The Spider
  69,    // Al-Ankabut 29:69 - Those who strive for Us, We guide them
  
  // Ar-Rum - The Romans
  21,    // Ar-Rum 30:21 - Among His signs are your spouses
  
  // Luqman - Luqman
  13,    // Luqman 31:13 - Do not associate partners with Allah
  17,    // Luqman 31:17 - Establish prayer, enjoin good
  18,    // Luqman 31:18 - Do not be arrogant
  
  // As-Sajdah - The Prostration
  16,    // As-Sajdah 32:16 - They forsake their beds to pray
  
  // Al-Ahzab - The Combined Forces
  41,    // Al-Ahzab 33:41 - O believers, remember Allah often
  42,    // Al-Ahzab 33:42 - And glorify Him morning and evening
  56,    // Al-Ahzab 33:56 - Allah and angels send blessings on the Prophet
  
  // Saba - Sheba
  39,    // Saba 34:39 - Whatever you spend, He will replace it
  
  // Fatir - The Originator
  2,     // Fatir 35:2 - Whatever mercy Allah opens to people
  
  // Ya-Sin - Ya-Sin
  58,    // Ya-Sin 36:58 - "Peace" - a word from a Merciful Lord
  82,    // Ya-Sin 36:82 - His command is "Be" and it is
  
  // As-Saffat - Those Lined Up
  180,   // As-Saffat 37:180-182 - Glory to your Lord
  
  // Sad - Sad
  35,    // Sad 38:35 - Forgive me and grant me kingdom
  
  // Az-Zumar - The Groups
  53,    // Az-Zumar 39:53 - Do not despair of Allah's mercy
  10,    // Az-Zumar 39:10 - Good reward for the patient
  
  // Ghafir - The Forgiver
  60,    // Ghafir 40:60 - Call upon Me, I will respond
  
  // Fussilat - Explained in Detail
  30,    // Fussilat 41:30 - Angels descend on those who say "Allah is our Lord"
  34,    // Fussilat 41:34 - Repel evil with that which is better
  44,    // Fussilat 41:44 - Say: It is guidance and healing
  
  // Ash-Shura - Consultation
  11,    // Ash-Shura 42:11 - Nothing is like Him
  19,    // Ash-Shura 42:19 - Allah is gentle with His servants
  
  // Az-Zukhruf - Gold Ornaments
  32,    // Az-Zukhruf 43:32 - The mercy of your Lord is better
  
  // Ad-Dukhan - The Smoke
  51,    // Ad-Dukhan 44:51 - Indeed, the righteous in gardens and springs
  
  // Al-Jathiyah - The Kneeling
  15,    // Al-Jathiyah 45:15 - Whoever does good, it is for himself
  
  // Muhammad - Muhammad
  7,     // Muhammad 47:7 - If you support Allah, He will support you
  
  // Al-Fath - The Victory
  29,    // Al-Fath 48:29 - Muhammad is the Messenger of Allah
  
  // Al-Hujurat - The Chambers
  10,    // Al-Hujurat 49:10 - The believers are brothers
  11,    // Al-Hujurat 49:11 - Do not mock one another
  12,    // Al-Hujurat 49:12 - Avoid much suspicion
  13,    // Al-Hujurat 49:13 - The most noble is the most righteous
  
  // Qaf - Qaf
  16,    // Qaf 50:16 - We are closer to him than his jugular vein
  
  // Adh-Dhariyat - The Scattering Winds
  56,    // Adh-Dhariyat 51:56 - I created jinn and mankind only to worship Me
  
  // At-Tur - The Mount
  48,    // At-Tur 52:48 - Be patient for the decision of your Lord
  
  // An-Najm - The Star
  39,    // An-Najm 53:39 - Man gets only what he strives for
  
  // Al-Qamar - The Moon
  17,    // Al-Qamar 54:17 - We have made the Quran easy for remembrance
  
  // Ar-Rahman - The Most Merciful
  13,    // Ar-Rahman 55:13 - Which favors of your Lord will you deny?
  60,    // Ar-Rahman 55:60 - Is the reward for good anything but good?
  
  // Al-Waqi'ah - The Event
  79,    // Al-Waqi'ah 56:79 - None touch it except the purified
  
  // Al-Hadid - Iron
  4,     // Al-Hadid 57:4 - He is with you wherever you are
  16,    // Al-Hadid 57:16 - Time for believers' hearts to soften
  21,    // Al-Hadid 57:21 - Race to forgiveness and Paradise
  
  // Al-Mujadila - The Pleading Woman
  11,    // Al-Mujadila 58:11 - Allah raises those who believe and have knowledge
  
  // Al-Hashr - The Gathering
  18,    // Al-Hashr 59:18 - Fear Allah and let every soul look what it prepared
  22,    // Al-Hashr 59:22 - He is Allah, there is no deity except Him
  
  // As-Saff - The Ranks
  10,    // As-Saff 61:10 - Shall I guide you to a trade that saves you?
  
  // Al-Jumu'ah - Friday
  9,     // Al-Jumu'ah 62:9 - When called to prayer on Friday, hasten
  10,    // Al-Jumu'ah 62:10 - Disperse in the land and seek Allah's bounty
  
  // At-Taghabun - Mutual Loss and Gain
  9,     // At-Taghabun 64:9 - The Day of Assembly
  16,    // At-Taghabun 64:16 - Fear Allah as much as you can
  
  // At-Talaq - Divorce
  2,     // At-Talaq 65:2 - Whoever fears Allah, He will make a way out
  3,     // At-Talaq 65:3 - Whoever trusts Allah, He is sufficient
  
  // At-Tahrim - The Prohibition
  8,     // At-Tahrim 66:8 - Repent to Allah with sincere repentance
  
  // Al-Mulk - The Dominion  
  2,     // Al-Mulk 67:2 - Who created death and life to test you
  12,    // Al-Mulk 67:12 - Those who fear their Lord unseen
  
  // Al-Qalam - The Pen
  4,     // Al-Qalam 68:4 - You are of great moral character
  
  // Al-Haqqah - The Inevitable
  1,     // Al-Haqqah 69:1 - The Inevitable Reality
  
  // Al-Ma'arij - The Ways of Ascent
  19,    // Al-Ma'arij 70:19 - Indeed, mankind was created anxious
  
  // Nuh - Noah
  10,    // Nuh 71:10 - Seek forgiveness from your Lord
  
  // Al-Jinn - The Jinn
  18,    // Al-Jinn 72:18 - The mosques are for Allah
  
  // Al-Muzzammil - The Enwrapped
  4,     // Al-Muzzammil 73:4 - And recite the Quran with measured recitation
  8,     // Al-Muzzammil 73:8 - Devote yourself wholly to His worship
  20,    // Al-Muzzammil 73:20 - Recite what is easy from the Quran
  
  // Al-Muddaththir - The Covered One
  1,     // Al-Muddaththir 74:1 - O you who covers himself
  
  // Al-Qiyamah - The Resurrection
  36,    // Al-Qiyamah 75:36 - Does man think he will be left neglected?
  
  // Al-Insan - The Human
  9,     // Al-Insan 76:9 - We feed you only for Allah's sake
  
  // Al-Mursalat - Those Sent Forth
  1,     // Al-Mursalat 77:1 - By those sent forth in succession
  
  // An-Naba - The News
  38,    // An-Naba 78:38 - The Day the Spirit and angels will stand
  
  // An-Nazi'at - Those Who Pull Out
  40,    // An-Nazi'at 79:40-41 - As for him who feared standing before his Lord
  
  // 'Abasa - He Frowned
  34,    // 'Abasa 80:34 - The Day a man will flee from his brother
  
  // At-Takwir - The Folding Up
  27,    // At-Takwir 81:27 - It is but a reminder for the worlds
  
  // Al-Infitar - The Breaking Apart
  6,     // Al-Infitar 82:6 - O mankind, what has deceived you about your Lord?
  
  // Al-Mutaffifin - The Defrauders
  1,     // Al-Mutaffifin 83:1 - Woe to those who give less
  
  // Al-Inshiqaq - The Splitting Open
  6,     // Al-Inshiqaq 84:6 - You will meet your Lord
  
  // Al-Buruj - The Great Stars
  11,    // Al-Buruj 85:11 - Those who believe and do good deeds
  
  // At-Tariq - The Night Visitor
  4,     // At-Tariq 86:4 - There is no soul without a protector
  
  // Al-A'la - The Most High
  1,     // Al-A'la 87:1 - Glorify the name of your Lord, the Most High
  14,    // Al-A'la 87:14 - He has certainly succeeded who purifies himself
  
  // Al-Ghashiyah - The Overwhelming
  21,    // Al-Ghashiyah 88:21 - So remind, you are only a reminder
  
  // Al-Fajr - The Dawn
  27,    // Al-Fajr 89:27-30 - O reassured soul, return to your Lord
  
  // Al-Balad - The City
  4,     // Al-Balad 90:4 - We have created man for struggle
  
  // Ash-Shams - The Sun
  9,     // Ash-Shams 91:9 - He has succeeded who purifies it
  
  // Al-Layl - The Night
  5,     // Al-Layl 92:5 - As for he who gives and fears Allah
  
  // Ad-Duhaa - The Morning Hours
  5,     // Ad-Duhaa 93:5 - And your Lord is going to give you
  11,    // Ad-Duhaa 93:11 - But as for the favor of your Lord, report it
  
  // Ash-Sharh - The Relief
  5,     // Ash-Sharh 94:5-6 - Verily, with hardship comes ease
  
  // At-Tin - The Fig
  4,     // At-Tin 95:4 - We created man in the best form
  
  // Al-'Alaq - The Clot
  1,     // Al-'Alaq 96:1 - Read in the name of your Lord
  19,    // Al-'Alaq 96:19 - Prostrate and draw near
  
  // Al-Qadr - The Power
  1,     // Al-Qadr 97:1 - We have sent it down on the Night of Decree
  
  // Al-Bayyinah - The Clear Proof
  7,     // Al-Bayyinah 98:7 - The best of creatures
  
  // Az-Zalzalah - The Earthquake
  7,     // Az-Zalzalah 99:7-8 - Whoever does an atom's weight of good will see it
  
  // Al-'Adiyat - The Chargers
  6,     // Al-'Adiyat 100:6 - Indeed mankind is ungrateful
  
  // Al-Qari'ah - The Striking Calamity
  6,     // Al-Qari'ah 101:6 - As for he whose scales are heavy
  
  // At-Takathur - Competition in Wealth
  1,     // At-Takathur 102:1 - Competition in worldly increase diverts you
  
  // Al-'Asr - The Time
  1,     // Al-'Asr 103:1-3 - By time, indeed mankind is in loss
  
  // Al-Humazah - The Slanderer
  1,     // Al-Humazah 104:1 - Woe to every slanderer and backbiter
  
  // Al-Fil - The Elephant
  1,     // Al-Fil 105:1 - Have you not considered how your Lord dealt
  
  // Quraysh
  3,     // Quraysh 106:3 - Let them worship the Lord of this House
  
  // Al-Ma'un - Small Kindnesses
  1,     // Al-Ma'un 107:1 - Have you seen the one who denies religion?
  
  // Al-Kawthar - Abundance
  1,     // Al-Kawthar 108:1 - Indeed, We have granted you al-Kawthar
  
  // Al-Kafirun - The Disbelievers
  6,     // Al-Kafirun 109:6 - For you is your religion, and for me is my religion
  
  // An-Nasr - The Victory
  1,     // An-Nasr 110:1-3 - When the victory of Allah comes
  
  // Al-Masad - The Palm Fiber
  1,     // Al-Masad 111:1 - May the hands of Abu Lahab be ruined
  
  // Al-Ikhlas - The Sincerity
  1,     // Al-Ikhlas 112:1-4 - Say: He is Allah, the One
  
  // Al-Falaq - The Daybreak
  1,     // Al-Falaq 113:1 - Say: I seek refuge in the Lord of daybreak
  
  // An-Nas - Mankind
  1,     // An-Nas 114:1 - Say: I seek refuge in the Lord of mankind
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
