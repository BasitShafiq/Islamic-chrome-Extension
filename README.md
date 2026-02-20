# 1-Minute Deen — Islamic New Tab Reminder

A calm, distraction-free Chrome extension that replaces your new tab with daily Islamic reminders from the Qur'an and Riyad as-Salihin.

## Features

- **Daily Reminders**: One reminder per day from Qur'an or authentic Hadith
- **Multi-language Support**: Toggle between Arabic, English, and Urdu translations
- **Streak Tracking**: Build a daily practice habit with streak counting
- **Prayer Time Awareness**: Subtle notification when prayer time enters
- **Calm Design**: Spiritual, distraction-free interface with cream/green palette

## Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the extension folder (containing `manifest.json`)
6. Open a new tab to see the extension in action

### Icons Setup

Before loading the extension, add your icon files:
- `icons/icon16.png` (16x16)
- `icons/icon48.png` (48x48)
- `icons/icon128.png` (128x128)

Or remove the `icons` section from `manifest.json` to use default icons.

## Architecture

```
/
├── manifest.json           # Chrome extension manifest (V3)
├── README.md
├── icons/                  # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── src/
    ├── newtab/            # New tab page
    │   ├── index.html
    │   └── index.js
    ├── components/        # UI components
    │   ├── Card.js
    │   └── PrayerBanner.js
    ├── services/          # API and business logic
    │   ├── quranService.js
    │   ├── hadithService.js
    │   ├── prayerService.js
    │   └── reminderService.js
    ├── storage/           # Chrome storage abstraction
    │   └── storageService.js
    ├── utils/             # Helper utilities
    │   ├── dateUtils.js
    │   └── locationUtils.js
    ├── data/              # Static data
    │   └── hadithData.js
    └── styles/            # CSS styles
        └── main.css
```

## Storage Keys

The extension uses `chrome.storage.local` with these keys:

| Key | Description |
|-----|-------------|
| `lastShownDate` | Date of last shown reminder (YYYY-MM-DD) |
| `reminderId` | ID of current reminder (e.g., "quran_255") |
| `language` | User's preferred language |
| `streak` | Current streak count |
| `lastCompletedDate` | Last completion date |
| `cachedReminder` | Cached reminder content |
| `cachedPrayerTimes` | Cached prayer times |
| `cachedLocation` | Cached user location |

## APIs Used

- **Qur'an**: [AlQuran Cloud API](https://alquran.cloud/api)
- **Prayer Times**: [Aladhan API](https://aladhan.com/prayer-times-api)
- **Hadith**: Static local collection (no external dependency)

## Design Principles

1. **Simplicity**: One reminder, one action, no clutter
2. **Calmness**: Soft colors, generous spacing, spiritual feel
3. **Performance**: Cache-first, instant load from storage
4. **Privacy**: No tracking, no accounts, no external analytics

## Privacy

This extension:
- Does NOT collect any personal data
- Does NOT send data to external servers (except API calls)
- Does NOT require an account
- Stores all data locally in your browser

## License

MIT License - Feel free to use and modify for personal or community projects.

## Contributing

Contributions welcome! Please maintain the calm, minimal design philosophy when adding features.

---

*"Indeed, in the remembrance of Allah do hearts find rest."* — Qur'an 13:28
