# Browser Compatibility Guide

## Cross-Browser Support

This extension is designed to work seamlessly across all major browsers using the WebExtensions API standard.

## Compatibility Strategy

### API Namespace Detection

Both Firefox and Chrome-based browsers use different API namespaces:

- **Firefox**: Uses `browser.*` (returns Promises)
- **Chrome/Edge/Brave/Opera**: Use `chrome.*` (uses callbacks, but Manifest V3 supports Promises)

Our solution uses inline polyfill detection:

```javascript
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
```

This simple pattern is used in:
- `content.js`
- `popup.js`

### Why This Approach?

1. **Lightweight**: No additional polyfill library needed
2. **Fast Loading**: No extra HTTP requests
3. **Simple**: Easy to understand and maintain
4. **Effective**: Works across all target browsers

### Browser-Specific Configurations

#### Manifest V3 (Primary)

Used by:
- Chrome 88+
- Edge 88+
- Brave (Chromium-based)
- Opera (Chromium-based)
- Firefox 109+

Key differences from V2:
- Uses `action` instead of `browser_action`
- Uses `host_permissions` separately from `permissions`
- Uses `scripting` permission for dynamic scripts

#### Manifest V2 (Fallback)

Provided as `manifest-v2.json` for:
- Older Firefox versions (57-108)
- Legacy browser support

Key differences:
- Uses `browser_action` instead of `action`
- Combines host permissions with general permissions
- Simpler `web_accessible_resources` format

### Firefox-Specific Settings

```json
"browser_specific_settings": {
  "gecko": {
    "id": "linkedin-contact-extractor@example.com",
    "strict_min_version": "109.0"
  }
}
```

- **gecko**: Firefox identifier
- **id**: Required for Firefox Add-ons (change before publishing)
- **strict_min_version**: Minimum Firefox version

### Permissions Used

| Permission | Purpose | V3 | V2 |
|------------|---------|----|----|
| `activeTab` | Access current tab | ✅ | ✅ |
| `scripting` | Inject scripts dynamically | ✅ | ❌ |
| `storage` | Store extracted data locally | ✅ | ✅ |
| `https://*.linkedin.com/*` | Access LinkedIn pages | ✅ | ✅ |

### API Usage

#### Chrome API (callbacks)

```javascript
// Old callback style (still supported)
chrome.tabs.query({active: true}, function(tabs) {
  // ...
});
```

#### Browser API (promises) / Chrome V3 (promises)

```javascript
// Modern promise style (works in all target browsers)
const tabs = await browser.tabs.query({active: true});
// or
const tabs = await chrome.tabs.query({active: true});
```

Our code uses async/await with Promises throughout, which works in:
- All Chromium browsers with Manifest V3
- Firefox with both V2 and V3

### Testing Checklist

When testing the extension, verify these features in each browser:

- [ ] Extension loads without errors
- [ ] Icon appears in toolbar
- [ ] Popup opens correctly
- [ ] Content script injects on Sales Navigator pages
- [ ] Extraction button appears
- [ ] Data extraction works
- [ ] Copy to clipboard functions
- [ ] Data persists in storage
- [ ] Navigation between profiles works

### Browser-Specific Issues

#### Chrome/Edge/Brave/Opera

- **Issue**: None known
- **Status**: ✅ Fully supported

#### Firefox

- **Issue**: Temporary installation only via `about:debugging`
- **Workaround**: Use Firefox Developer Edition or sign extension
- **Status**: ⚠️ Requires signing for permanent installation

### Future Compatibility

#### Manifest V3 Transition

- Chrome: Already on V3
- Edge: Already on V3
- Firefox: V3 support since 109
- Opera: Following Chrome timeline
- Brave: Following Chrome timeline

All browsers are moving to Manifest V3, so our primary manifest.json is future-proof.

#### API Changes

If APIs change in the future:

1. Update selectors in `content.js` SELECTORS object
2. Test extraction on new LinkedIn layouts
3. Update this compatibility guide
4. Bump version number

### Development Notes

#### Adding New Features

When adding new WebExtensions API usage:

1. Check compatibility: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs
2. Use `browserAPI` variable (don't use `chrome.*` or `browser.*` directly)
3. Test in at least Firefox and Chrome
4. Use Promises (async/await) not callbacks

#### Publishing

Before publishing to stores:

1. **Chrome Web Store**: Use `manifest.json` as-is
2. **Firefox Add-ons**:
   - Change `gecko.id` to unique value
   - Submit for review
   - Consider V2 version for older Firefox
3. **Edge Add-ons**: Use `manifest.json` as-is
4. **Opera Add-ons**: Use `manifest.json` as-is

### Resources

- [MDN WebExtensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Chrome Extensions Docs](https://developer.chrome.com/docs/extensions/)
- [Browser Compatibility Table](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/migrating/)

### Support Matrix

| Browser | Version | Manifest | Status |
|---------|---------|----------|--------|
| Chrome | 88+ | V3 | ✅ Fully Supported |
| Firefox | 109+ | V3 | ✅ Fully Supported |
| Firefox | 57-108 | V2 | ✅ Use manifest-v2.json |
| Edge | 88+ | V3 | ✅ Fully Supported |
| Brave | Current | V3 | ✅ Fully Supported |
| Opera | Current | V3 | ✅ Fully Supported |

---

**Last Updated**: 2025-10-24
