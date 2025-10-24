# SEO Audit Tool - Browser Extension

A powerful browser extension that provides instant, on-page SEO insights as you browse your website. Perfect for conducting comprehensive SEO audits without switching between multiple tools.

## Features

### Core SEO Analysis

- **Meta Tag Analysis**
  - Title tag with character count validation (recommended: 30-60 characters)
  - Meta description with length check (recommended: 120-160 characters)
  - Language and charset detection
  - Keywords meta tag

- **Header Structure**
  - Complete hierarchy of H1-H6 tags
  - Warns about multiple H1 tags or missing H1
  - Full text preview of each heading

- **Link Analysis**
  - Total link count (internal/external breakdown)
  - NoFollow/DoFollow tracking
  - External links list with URLs
  - Broken link detection

- **Image Analysis**
  - Total image count
  - Images with/without alt text
  - Detailed list of images missing alt text
  - Image dimensions

- **Performance Metrics**
  - DOM Interactive time
  - DOM Content Loaded time
  - Load Complete time
  - Transfer size

- **Technical SEO**
  - Canonical URL detection
  - Robots meta tags (noindex/nofollow warnings)
  - Indexing status indicator

- **Social Media Tags**
  - Open Graph tags (title, description, image, URL)
  - Twitter Card metadata

- **Structured Data**
  - Schema.org detection
  - Count and types of structured data

- **Additional Insights**
  - Page word count
  - Current URL display

## Installation

### Chrome/Edge Installation

1. Download or clone this repository
2. Open Chrome/Edge and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `seo-extension` folder
6. The extension icon should appear in your toolbar

### Firefox Installation

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Navigate to the `seo-extension` folder and select `manifest.json`
6. The extension will be loaded temporarily

**Note:** For permanent Firefox installation, you'll need to sign the extension through Mozilla's process.

## Usage

1. Navigate to any webpage you want to audit
2. Click the SEO Audit Tool icon in your browser toolbar
3. The extension will instantly analyze the current page
4. Review all SEO metrics in the organized popup interface
5. Use the refresh button (🔄) to re-analyze after making changes

## Understanding the Results

### Meta Tags

- **Green checkmark (✓)**: Optimal length
- **Yellow warning (⚠️)**: Too short or too long
- **Red X (❌)**: Missing or critical issue

**Best Practices:**
- Title: 30-60 characters
- Meta description: 120-160 characters
- Always include both on every page

### Headers

- **Warning**: Multiple H1 tags (should only have one)
- **Error**: Missing H1 tag
- Check that headers follow logical hierarchy (H1 → H2 → H3, etc.)

### Links

- **Internal links**: Links to pages on your own domain
- **External links**: Links to other websites
- **NoFollow**: Links that don't pass SEO value
- High internal link count is good for site structure

### Images

- **Critical**: All images should have descriptive alt text
- Alt text helps with accessibility and SEO
- Review the "Missing Alt" section to fix issues

### Performance

- **DOM Interactive**: When page becomes interactive
- **Load Complete**: Total page load time
- Faster is better for both SEO and user experience
- Under 3 seconds is ideal

### Robots & Indexing

- **NOINDEX**: Page won't appear in search results (usually intentional)
- **Canonical URL**: Tells search engines the preferred version of a page
- Missing canonical may cause duplicate content issues

### Social Media Tags

- Ensures your pages look good when shared on social platforms
- OG tags for Facebook, LinkedIn, etc.
- Twitter Card tags for Twitter
- Missing tags mean social platforms will guess at content

### Structured Data

- Helps search engines understand your content better
- Can enable rich snippets in search results
- Types shown indicate what kind of data is marked up

## Development

### Project Structure

```
seo-extension/
├── manifest.json       # Extension configuration
├── popup.html          # Extension popup UI
├── popup.js            # Popup logic and data display
├── popup.css           # Styling for popup
├── content.js          # Page analysis script
├── icons/              # Extension icons
│   ├── icon.svg        # SVG template
│   └── README.md       # Icon instructions
└── README.md           # This file
```

### Customization

You can customize the extension by modifying:

- **popup.css**: Change colors, layout, fonts
- **content.js**: Add new SEO checks or modify existing ones
- **popup.js**: Change how data is displayed

### Adding New Checks

To add a new SEO check:

1. Add analysis logic in `content.js` in the `analyzePage()` function
2. Add corresponding HTML section in `popup.html`
3. Add display logic in `popup.js`
4. Style as needed in `popup.css`

## Browser Compatibility

- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Brave
- ✅ Opera
- ⚠️ Firefox (with minor modifications to manifest.json for v2)

## Testing

Test the extension on your website:

1. Navigate to `test-site/index.html` in this repository
2. Open the extension
3. Verify all metrics are collected correctly

## Limitations

- Performance metrics may not be available on all pages
- Some single-page applications (SPAs) may require page refresh
- CORS restrictions may limit some analysis features
- Icon files need to be generated (see icons/README.md)

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License

This project is open source and available under the MIT License.

## Changelog

### Version 1.0.0
- Initial release
- Core SEO metrics analysis
- Meta tags, headers, links, images
- Performance monitoring
- Social media tags
- Structured data detection

## Support

For issues or questions:
1. Check this README
2. Review the code comments
3. Test on the included test-site
4. Submit an issue on the repository

## Tips for Best Results

1. **Run on published pages**: Some metrics work best on live URLs
2. **Check multiple pages**: SEO issues vary by page type
3. **Use during development**: Catch issues before deployment
4. **Compare with competitors**: Use on competitor sites to learn
5. **Regular audits**: Run weekly or after major changes

## Recommended SEO Resources

- [Google Search Central](https://developers.google.com/search)
- [Moz SEO Guide](https://moz.com/beginners-guide-to-seo)
- [Ahrefs Blog](https://ahrefs.com/blog/)
- [Schema.org](https://schema.org/)

---

Built for developers and SEO professionals who want quick, actionable insights while browsing.
