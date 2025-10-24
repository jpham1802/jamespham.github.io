# LinkedIn Contact Extractor

A cross-browser extension that extracts contact information from LinkedIn Sales Navigator profile pages. Works seamlessly across Chrome, Firefox, Edge, Brave, and Opera.

## Features

- **One-Click Extraction**: Extract contact information with a single click
- **Comprehensive Data**: Captures Full Name, Job Title, Location, and Company Name
- **Clean Interface**: Beautiful popup with easy-to-read formatting
- **Copy Functions**: Individual field copying or copy all data at once
- **Smart Detection**: Automatically detects LinkedIn Sales Navigator pages
- **Cross-Browser**: Works on all major browsers
- **Privacy-First**: All data processing happens locally, nothing sent to external servers

## Supported Browsers

- ✅ Google Chrome (version 88+)
- ✅ Mozilla Firefox (version 109+)
- ✅ Microsoft Edge (version 88+)
- ✅ Brave Browser
- ✅ Opera Browser

## Installation Instructions

### Google Chrome

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `linkedin-contact-extractor` folder
6. The extension icon should appear in your toolbar

### Mozilla Firefox

#### Option 1: Manifest V3 (Firefox 109+)

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Navigate to the `linkedin-contact-extractor` folder
5. Select the `manifest.json` file
6. The extension will be loaded temporarily

#### Option 2: Manifest V2 (Older Firefox versions)

1. In the `linkedin-contact-extractor` folder, rename `manifest-v2.json` to `manifest.json` (backup the original first)
2. Follow the same steps as Option 1

**Note**: For permanent installation in Firefox, the extension needs to be signed by Mozilla or you need to use Firefox Developer Edition/Nightly with `xpinstall.signatures.required` set to `false` in `about:config`.

### Microsoft Edge

1. Download or clone this repository
2. Open Edge and navigate to `edge://extensions/`
3. Enable "Developer mode" (toggle in bottom-left corner)
4. Click "Load unpacked"
5. Select the `linkedin-contact-extractor` folder
6. The extension icon should appear in your toolbar

### Brave Browser

1. Download or clone this repository
2. Open Brave and navigate to `brave://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `linkedin-contact-extractor` folder
6. The extension icon should appear in your toolbar

### Opera Browser

1. Download or clone this repository
2. Open Opera and navigate to `opera://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `linkedin-contact-extractor` folder
6. The extension icon should appear in your toolbar

## How to Use

### Method 1: Using the Floating Button

1. Navigate to any LinkedIn Sales Navigator profile page
   - Example: `https://www.linkedin.com/sales/lead/...`
   - Example: `https://www.linkedin.com/sales/people/...`
2. Look for the blue "Extract Contact" button in the bottom-right corner of the page
3. Click the button to extract contact information
4. The extension popup will automatically display the extracted data

### Method 2: Using the Extension Popup

1. Navigate to any LinkedIn Sales Navigator profile page
2. Click the extension icon in your browser toolbar
3. Click the "Extract Contact Info" button in the popup
4. View the extracted data in the popup

### Copying Data

- **Individual Fields**: Click the copy icon next to any field
- **All Data**: Click the "Copy All" button to copy all information in a formatted layout
- **Clear Data**: Click the "Clear" button to reset the display

### Extracted Data Format

When you click "Copy All", the data is formatted as:

```
LinkedIn Contact Information
==================================================

Full Name: John Doe
Job Title: Senior Software Engineer
Location: San Francisco, California
Company: Tech Company Inc.

Extracted on: [timestamp]
Source: [LinkedIn URL]
==================================================
```

## Technical Details

### Architecture

- **Manifest Version**: V3 (with V2 fallback for older Firefox versions)
- **Permissions**:
  - `activeTab`: Access to the current active tab
  - `scripting`: To inject content scripts
  - `storage`: To save extracted data locally
- **Host Permissions**: `https://*.linkedin.com/*`

### File Structure

```
linkedin-contact-extractor/
├── manifest.json          # Manifest V3 configuration
├── manifest-v2.json       # Manifest V2 for older Firefox
├── popup.html            # Extension popup interface
├── popup.js              # Popup logic and UI handling
├── content.js            # Content script for DOM extraction
├── styles.css            # Styles for popup and content button
├── generate_icons.py     # Script to generate icons
├── icons/
│   ├── icon16.png       # 16x16 icon
│   ├── icon48.png       # 48x48 icon
│   ├── icon128.png      # 128x128 icon
│   └── icon.svg         # Source SVG icon
└── README.md            # This file
```

### DOM Extraction Strategy

The extension uses multiple fallback selectors to ensure robust extraction even if LinkedIn updates their page structure. The content script searches for:

- **Full Name**: Profile header elements, name containers
- **Job Title**: Title fields in profile cards
- **Location**: Geographic location indicators
- **Company**: Current company information from experience section

### Cross-Browser Compatibility

The extension uses the WebExtensions API standard and includes polyfills to work across all browsers:

```javascript
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
```

This ensures compatibility with:
- Chrome's `chrome.*` API
- Firefox's `browser.*` API
- Edge (Chromium-based) using Chrome's API
- Brave using Chrome's API
- Opera using Chrome's API

## Privacy & Security

- **Local Processing**: All data extraction and processing happens locally in your browser
- **No External Servers**: No data is sent to any external servers
- **No Analytics**: No tracking or analytics
- **Open Source**: Full source code available for inspection
- **Minimal Permissions**: Only requests necessary permissions

## Troubleshooting

### Extension not working?

1. **Refresh the page**: After installing, refresh any open LinkedIn pages
2. **Check the URL**: Ensure you're on a Sales Navigator page (`linkedin.com/sales/`)
3. **Check permissions**: Verify the extension has permissions for LinkedIn in your browser settings
4. **Clear cache**: Clear browser cache and reload the extension
5. **Check console**: Open browser DevTools (F12) and check for any error messages

### No data extracted?

1. **Page structure changed**: LinkedIn may have updated their page structure
2. **Profile type**: Ensure you're on a full profile page, not a search results page
3. **Loading time**: Wait for the page to fully load before extracting
4. **Browser console**: Check the browser console (F12) for error messages

### Button not appearing?

1. **Check URL**: The button only appears on Sales Navigator pages
2. **Wait for page load**: Give the page a few seconds to fully load
3. **Refresh**: Try refreshing the page
4. **Content script**: Check if content script loaded in DevTools > Sources

## Browser-Specific Notes

### Chrome/Edge/Brave

- Extension works out of the box with Manifest V3
- All features fully supported

### Firefox

- **Firefox 109+**: Full Manifest V3 support
- **Older versions**: Use the Manifest V2 version (rename `manifest-v2.json`)
- **Temporary installation**: Extensions loaded via `about:debugging` are temporary and removed when Firefox closes
- **Permanent installation**: Requires signing by Mozilla or using Developer/Nightly edition

### Opera

- Uses Chromium engine, works identically to Chrome
- All features fully supported

## Development

### Prerequisites

- Python 3.x (for generating icons)
- Pillow library (`pip install Pillow`)

### Regenerating Icons

```bash
cd linkedin-contact-extractor
python3 generate_icons.py
```

### Modifying Selectors

If LinkedIn changes their page structure, you can update the selectors in `content.js`:

```javascript
const SELECTORS = {
  fullName: ['selector1', 'selector2', 'fallback'],
  jobTitle: ['selector1', 'selector2', 'fallback'],
  // ... etc
};
```

### Testing

1. Test on multiple profile pages
2. Test with profiles that have missing fields
3. Test navigation between profiles (SPA behavior)
4. Test in each browser
5. Test copy functionality
6. Test with browser console open for errors

## Limitations

- Only works on LinkedIn Sales Navigator pages
- Requires an active LinkedIn Sales Navigator subscription
- Limited to publicly visible profile information
- May break if LinkedIn significantly changes their page structure
- Temporary installation in Firefox (unless signed)

## Contributing

Contributions are welcome! Please feel free to:

1. Report bugs or issues
2. Suggest new features
3. Submit pull requests
4. Improve documentation
5. Update selectors if LinkedIn changes their structure

## License

MIT License - Feel free to use, modify, and distribute this extension.

## Disclaimer

This extension is not affiliated with, endorsed by, or sponsored by LinkedIn Corporation. It is an independent tool created to improve workflow efficiency. Use responsibly and in accordance with LinkedIn's Terms of Service.

## Support

For issues, questions, or suggestions:

1. Check the Troubleshooting section above
2. Open an issue in the repository
3. Check browser console for error messages
4. Ensure you're using the latest version

## Version History

### Version 1.0.0 (Current)

- Initial release
- Support for Chrome, Firefox, Edge, Brave, and Opera
- Extract Full Name, Job Title, Location, and Company
- One-click extraction via floating button
- Popup interface with copy functions
- Cross-browser compatibility with WebExtensions API
- Manifest V3 with V2 fallback

---

**Made with ❤️ for productivity**
