# Troubleshooting Guide

## Error: "Manifest file is missing or unreadable"

This is the most common installation error. Here's how to fix it:

### Step 1: Verify Folder Structure

Your folder structure should look like this:

```
linkedin-contact-extractor/
├── manifest.json          ← This file MUST be at the root
├── manifest-v2.json
├── popup.html
├── popup.js
├── content.js
├── styles.css
├── README.md
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

**WRONG** folder structure (common mistake):
```
linkedin-contact-extractor/
└── linkedin-contact-extractor/    ← Extra nested folder!
    ├── manifest.json
    └── ...
```

### Step 2: Run Verification Script

1. Open Command Prompt or PowerShell
2. Navigate to the extension folder:
   ```
   cd path\to\linkedin-contact-extractor
   ```
3. Run the verification script:
   ```
   python verify_extension.py
   ```
4. Check for any missing files

### Step 3: Check You're Selecting the RIGHT Folder

When you click "Load unpacked" in Edge, you must select the folder that **directly contains** `manifest.json`.

**Example (CORRECT):**
```
📁 Downloads
  └── 📁 linkedin-contact-extractor    ← Select THIS folder
      ├── 📄 manifest.json
      ├── 📄 popup.html
      └── ...
```

**Example (WRONG):**
```
📁 Downloads    ← Don't select this
  └── 📁 linkedin-contact-extractor
      ├── 📄 manifest.json
      └── ...
```

### Step 4: Fix Common Issues

#### Issue 1: Extra Nested Folder

If you extracted from a ZIP file and got:
```
linkedin-contact-extractor/linkedin-contact-extractor/manifest.json
```

**Fix:** Move all files one level up, or select the inner folder when loading.

#### Issue 2: Files in Root of Downloads

If your files are like:
```
Downloads/manifest.json
Downloads/popup.html
...
```

**Fix:** Create a new folder called `linkedin-contact-extractor` and move all files into it.

#### Issue 3: Wrong File Selected

If you selected `manifest.json` directly instead of the folder:

**Fix:** Select the **folder containing** manifest.json, not the file itself.

#### Issue 4: File Permissions (Windows)

If files are read-only or blocked:

**Fix:**
1. Right-click the folder → Properties
2. Uncheck "Read-only" if checked
3. Click "Apply to all subfolders"
4. If there's a "Unblock" button, click it

### Step 5: Detailed Edge Installation Steps

1. **Open Edge Extensions Page:**
   - Type `edge://extensions/` in the address bar
   - Press Enter

2. **Enable Developer Mode:**
   - Look at the **bottom-left corner**
   - Toggle "Developer mode" to **ON**
   - You should see new buttons appear

3. **Load the Extension:**
   - Click the "Load unpacked" button (should be in top-left area)
   - A file browser will open
   - Navigate to your `linkedin-contact-extractor` folder
   - Click "Select Folder" (NOT "Open" - you need to select the folder itself)

4. **Verify Installation:**
   - You should see "LinkedIn Contact Extractor" appear in the extensions list
   - If you see errors, read them carefully - they often tell you exactly what's wrong

### Still Having Issues?

#### Quick Checklist:

- [ ] I'm selecting a **folder**, not a file
- [ ] The folder I'm selecting **directly contains** manifest.json (not in a subfolder)
- [ ] manifest.json is at the root of the folder
- [ ] All required files are present (run `python verify_extension.py`)
- [ ] Developer mode is enabled in Edge
- [ ] I'm clicking "Select Folder" not opening files

#### Try This:

1. Create a new folder on your Desktop called `test-extension`
2. Copy ALL files from linkedin-contact-extractor into this new folder
3. Make absolutely sure manifest.json is directly in `test-extension/manifest.json`
4. Try loading this new folder

#### Command Line Verification (Windows):

```cmd
cd path\to\linkedin-contact-extractor
dir manifest.json
```

You should see:
```
 Directory of C:\path\to\linkedin-contact-extractor

[date]  [time]            1,064 manifest.json
```

If you see "File Not Found", you're in the wrong folder!

#### Command Line Verification (Mac/Linux):

```bash
cd path/to/linkedin-contact-extractor
ls -la manifest.json
```

You should see the file listed.

### Alternative: Create Fresh Extension Package

If nothing works, let's create a fresh package:

1. Create a new folder: `linkedin-contact-extractor-fresh`
2. Copy these files from the repository one by one:
   - manifest.json
   - manifest-v2.json
   - popup.html
   - popup.js
   - content.js
   - styles.css
   - README.md
3. Create an `icons` subfolder
4. Copy all PNG files into the icons folder
5. Verify the structure matches Step 1 above
6. Try loading this fresh folder

### Getting More Help

If you're still stuck, please provide:

1. Screenshot of your folder structure (file explorer)
2. Screenshot of the error message in Edge
3. Output of the verification script
4. Your Edge version (edge://settings/help)
5. Your operating system

This will help diagnose the specific issue!

---

## Other Common Issues

### Extension Doesn't Appear on LinkedIn

**Symptom:** Extension loaded successfully but button doesn't appear

**Fixes:**
1. Make sure you're on a **Sales Navigator** page (`linkedin.com/sales/`)
2. Refresh the page after loading the extension
3. Check if you're on a profile page, not search results
4. Open DevTools (F12) → Console tab → Look for any errors

### Extraction Button Appears But Doesn't Work

**Fixes:**
1. Open DevTools (F12) → Console tab
2. Look for error messages
3. Refresh the page
4. Make sure you clicked "Extract Contact" not just viewing it
5. Check if the profile has fully loaded

### Popup Opens But Shows "Not LinkedIn" Warning

**Fixes:**
1. Verify you're on `linkedin.com/sales/*`
2. Refresh the page
3. The extension only works on Sales Navigator, not regular LinkedIn

### Data Fields Show "Not found"

**Possible causes:**
1. The profile doesn't have that information
2. LinkedIn changed their page structure
3. You need to scroll to make the data visible

**Fixes:**
1. Scroll down the page to load all content
2. Wait 2-3 seconds for the page to fully load
3. Check if the data is actually visible on the page
4. If LinkedIn changed their structure, the selectors may need updating

### Copy to Clipboard Doesn't Work

**Fixes:**
1. Make sure you're using HTTPS (not HTTP)
2. Grant clipboard permissions if your browser asks
3. Try clicking the copy button again
4. Try the "Copy All" button instead

---

## Browser-Specific Issues

### Microsoft Edge

- **Issue:** "This extension requires additional permissions"
  - **Fix:** Click "Allow" when prompted

- **Issue:** Extension disappears after restart
  - **Fix:** This is normal for unpacked extensions in developer mode. Re-load it.

### Google Chrome

- Same troubleshooting steps as Edge
- Chrome extensions page: `chrome://extensions/`

### Firefox

- Extensions page: `about:debugging#/runtime/this-firefox`
- Temporary extensions are removed when Firefox closes (this is normal)
- For permanent installation, use Firefox Developer Edition or sign the extension

### Brave

- Extensions page: `brave://extensions/`
- All same steps as Chrome

### Opera

- Extensions page: `opera://extensions/`
- All same steps as Chrome

---

## Need More Help?

1. Run the verification script: `python verify_extension.py`
2. Check the console for errors (F12 → Console)
3. Verify your folder structure matches the guide
4. Create a GitHub issue with details
5. Include screenshots and error messages

Good luck! 🚀
