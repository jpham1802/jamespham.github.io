#!/usr/bin/env python3
"""
Verification script for LinkedIn Contact Extractor extension.
Run this to check if all required files are present and valid.
"""

import os
import json
from pathlib import Path

def check_file_exists(file_path, description):
    """Check if a file exists and print status"""
    if os.path.exists(file_path):
        size = os.path.getsize(file_path)
        print(f"✓ {description}: {file_path.name} ({size} bytes)")
        return True
    else:
        print(f"✗ {description}: {file_path.name} - MISSING!")
        return False

def validate_json(file_path):
    """Validate JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            json.load(f)
        return True
    except Exception as e:
        print(f"  └─ JSON Error: {e}")
        return False

def main():
    """Run verification checks"""
    print("=" * 60)
    print("LinkedIn Contact Extractor - Verification Script")
    print("=" * 60)
    print()

    # Get current directory
    current_dir = Path(__file__).parent
    print(f"Checking directory: {current_dir.absolute()}")
    print()

    all_ok = True

    # Required files
    required_files = [
        ('manifest.json', 'Manifest V3 file'),
        ('manifest-v2.json', 'Manifest V2 file'),
        ('popup.html', 'Popup HTML'),
        ('popup.js', 'Popup JavaScript'),
        ('content.js', 'Content script'),
        ('styles.css', 'Stylesheet'),
        ('README.md', 'Documentation'),
    ]

    print("Required Files:")
    print("-" * 60)
    for filename, description in required_files:
        file_path = current_dir / filename
        exists = check_file_exists(file_path, description)

        # Validate JSON files
        if exists and filename.endswith('.json'):
            if validate_json(file_path):
                print(f"  └─ ✓ Valid JSON")
            else:
                all_ok = False

        if not exists:
            all_ok = False

    print()

    # Check icons directory
    print("Icons Directory:")
    print("-" * 60)
    icons_dir = current_dir / 'icons'
    if icons_dir.exists() and icons_dir.is_dir():
        print(f"✓ icons/ directory exists")

        required_icons = ['icon16.png', 'icon48.png', 'icon128.png']
        for icon in required_icons:
            icon_path = icons_dir / icon
            if not check_file_exists(icon_path, f"  Icon"):
                all_ok = False
    else:
        print(f"✗ icons/ directory - MISSING!")
        all_ok = False

    print()
    print("=" * 60)

    if all_ok:
        print("✓ ALL CHECKS PASSED!")
        print()
        print("Your extension is ready to load.")
        print()
        print("Next steps for Edge:")
        print("1. Open Edge and go to: edge://extensions/")
        print("2. Enable 'Developer mode' (toggle in bottom-left)")
        print("3. Click 'Load unpacked'")
        print("4. Select THIS FOLDER (the one containing manifest.json)")
        print()
    else:
        print("✗ SOME CHECKS FAILED!")
        print()
        print("Please ensure all required files are present.")
        print("You may need to re-download or re-extract the extension.")
        print()

    print("=" * 60)

    return 0 if all_ok else 1

if __name__ == '__main__':
    exit(main())
