# Ramadan Tracker Desktop App

A desktop application for Ramadan Tracker built with Electron, providing easy access to prayer times, Quran reading, Hadiths, and more during the blessed month of Ramadan.

## Features

- 📱 **Desktop Application**: Native desktop experience for Windows, macOS, and Linux
- 🕌 **Prayer Times**: Accurate prayer times with notifications
- 📖 **Quran Reader**: Complete Quran with reading progress tracking
- 📚 **Hadiths Collection**: Authentic hadiths from various collections
- 🧭 **Qibla Direction**: Find the direction of the Kaaba
- 📅 **Hijri Calendar**: Islamic calendar integration
- 🔔 **Notifications**: Prayer time reminders
- 🔄 **Auto Updates**: Automatic application updates
- 🌐 **Online Sync**: Syncs with your web account at shaharia.me

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Add app icon**
   - Copy your app icon to `assets/icon.png` (256x256 pixels recommended)
   - For Windows: Also add `assets/icon.ico`
   - For macOS: Also add `assets/icon.icns`

## Development

### Running in Development Mode

```bash
npm run dev
```

This will start the app in development mode, loading from `http://localhost:5000` (make sure your web server is running).

### Running in Production Mode

```bash
npm start
```

This will load the app from `https://shaharia.me`.

## Building

### Build for Windows
```bash
npm run build:win
```

### Build for macOS
```bash
npm run build:mac
```

### Build for Linux
```bash
npm run build:linux
```

### Build for All Platforms
```bash
npm run build
```

The built applications will be available in the `dist` folder.

## Project Structure

```
ramdantraker_desktop/
├── main.js              # Main Electron process
├── preload.js           # Preload script for security
├── package.json         # Project configuration
├── assets/              # App icons and assets
│   ├── icon.png         # Main app icon
│   ├── icon.ico         # Windows icon
│   └── icon.icns        # macOS icon
└── README.md           # This file
```

## Configuration

### Development vs Production

The app automatically detects if it's running in development mode:
- **Development**: Loads from `http://localhost:5000` and opens DevTools
- **Production**: Loads from `https://shaharia.me`

### Auto Updates

The app includes automatic update functionality using `electron-updater`. Updates are checked automatically when the app starts.

## Security Features

- **Context Isolation**: Prevents direct access to Node.js APIs from renderer process
- **Web Security**: Enabled by default
- **External Links**: All external links open in the default browser
- **No Node Integration**: Renderer process doesn't have Node.js integration

## Menu Features

The app includes a native menu with:
- **File**: Refresh, Developer Tools, Quit
- **Edit**: Standard edit operations (cut, copy, paste, etc.)
- **View**: Zoom controls, fullscreen toggle
- **Window**: Minimize, close
- **Help**: About dialog, visit website

## Troubleshooting

### Common Issues

1. **App won't start**
   - Make sure Node.js is installed and up to date
   - Check that all dependencies are installed: `npm install`

2. **Build fails**
   - Ensure you have the correct icon files in the assets folder
   - Check that electron-builder is properly installed

3. **App loads blank page**
   - In development: Make sure your web server is running on port 5000
   - In production: Check your internet connection

### Development Tips

- Use `F12` to open Developer Tools
- Use `Ctrl+R` (or `Cmd+R` on macOS) to refresh the app
- Check the console for any error messages

## License

This project is licensed under the MIT License.

## Support

For support, visit [https://shaharia.me](https://shaharia.me) or create an issue in the repository.

## Version History

- **v1.0.0**: Initial release with basic functionality

---

**Note**: This desktop app is designed to work with the Ramadan Tracker website hosted at shaharia.me. Make sure the website is accessible for full functionality. 