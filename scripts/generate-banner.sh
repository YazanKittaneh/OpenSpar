#!/bin/bash

# Generate Debate Arena banner PNG from SVG
# Requires: Inkscape or ImageMagick

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SVG_FILE="$PROJECT_ROOT/docs/images/banner.svg"
PNG_FILE="$PROJECT_ROOT/docs/images/banner.png"

echo "🎨 Debate Arena Banner Generator"
echo "================================="
echo ""

# Check if SVG exists
if [ ! -f "$SVG_FILE" ]; then
    echo "❌ Error: SVG file not found at $SVG_FILE"
    exit 1
fi

# Try Inkscape first (best quality)
if command -v inkscape &> /dev/null; then
    echo "✅ Using Inkscape for high-quality export..."
    inkscape "$SVG_FILE" \
        --export-filename="$PNG_FILE" \
        --export-width=2400 \
        --export-height=600 \
        --export-background="#000000"
    echo "✅ Banner generated: $PNG_FILE"
    
# Fall back to ImageMagick
elif command -v convert &> /dev/null; then
    echo "✅ Using ImageMagick..."
    convert -background none -density 300 "$SVG_FILE" \
        -resize 2400x600 \
        -extent 2400x600 -gravity center \
        "$PNG_FILE"
    echo "✅ Banner generated: $PNG_FILE"
    
else
    echo "❌ Error: Neither Inkscape nor ImageMagick found"
    echo ""
    echo "Please install one of:"
    echo "  • Inkscape: brew install inkscape (macOS)"
    echo "  • ImageMagick: brew install imagemagick (macOS)"
    echo "  • Or use your package manager on Linux"
    exit 1
fi

# Optimize with pngquant if available
if command -v pngquant &> /dev/null; then
    echo "🔧 Optimizing with pngquant..."
    pngquant --quality=80-95 --force --output "$PNG_FILE" "$PNG_FILE"
    echo "✅ Optimized!"
fi

echo ""
echo "🎉 Banner ready at: $PNG_FILE"
echo ""
echo "Next steps:"
echo "  1. Preview the banner: open $PNG_FILE"
echo "  2. Update README.md if needed"
echo "  3. Commit both banner.svg and banner.png"
echo ""
