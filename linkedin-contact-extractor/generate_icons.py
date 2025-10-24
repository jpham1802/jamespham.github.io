#!/usr/bin/env python3
"""
Generate PNG icons from SVG for the LinkedIn Contact Extractor extension.
Creates icons in sizes: 16x16, 48x48, and 128x128 pixels.
"""

import os
from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("PIL/Pillow not available, creating simple PNG icons directly...")
    import sys

def create_icon_pil(size):
    """Create a simple icon using PIL"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # LinkedIn blue color
    linkedin_blue = (10, 102, 194, 255)
    white = (255, 255, 255, 255)

    # Draw circle background
    padding = size // 8
    draw.ellipse([padding, padding, size - padding, size - padding],
                 fill=linkedin_blue)

    # Draw simplified contact card
    card_padding = size // 4
    card_width = size - (card_padding * 2)
    card_height = card_width * 3 // 4
    card_y = (size - card_height) // 2

    draw.rectangle([card_padding, card_y,
                   card_padding + card_width, card_y + card_height],
                  fill=white, outline=None)

    # Draw profile circle
    profile_size = size // 6
    profile_x = card_padding + size // 12
    profile_y = card_y + size // 12
    draw.ellipse([profile_x, profile_y,
                 profile_x + profile_size, profile_y + profile_size],
                fill=linkedin_blue)

    # Draw contact lines
    line_x = profile_x + profile_size + size // 20
    line_width = card_width // 3
    line_height = max(2, size // 40)

    for i in range(3):
        line_y = profile_y + (i * (profile_size // 2))
        draw.rectangle([line_x, line_y,
                       line_x + line_width - (i * size // 30), line_y + line_height],
                      fill=linkedin_blue)

    return img

def main():
    """Generate icons in multiple sizes"""
    script_dir = Path(__file__).parent
    icons_dir = script_dir / 'icons'
    icons_dir.mkdir(exist_ok=True)

    sizes = [16, 48, 128]

    print("Generating extension icons...")

    for size in sizes:
        try:
            # Create icon
            img = create_icon_pil(size)

            # Save as PNG
            output_path = icons_dir / f'icon{size}.png'
            img.save(output_path, 'PNG')
            print(f"✓ Created {output_path.name} ({size}x{size})")

        except Exception as e:
            print(f"✗ Error creating icon{size}.png: {e}")
            return False

    print("\n✓ All icons generated successfully!")
    return True

if __name__ == '__main__':
    try:
        success = main()
        exit(0 if success else 1)
    except Exception as e:
        print(f"Error: {e}")
        exit(1)
