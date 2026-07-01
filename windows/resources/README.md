# Windows Resources

This directory contains Windows-specific assets:

## Required Files

### `one2lvos.ico`
- **Format**: Windows Icon (.ico)
- **Size**: 256x256 (multi-resolution recommended: 16, 32, 48, 64, 128, 256)
- **Colors**: True color with alpha channel

### `one2lvos-banner.bmp`
- **Format**: Windows BMP
- **Size**: 164x314 pixels (Inno Setup wizard banner)

### `one2lvos-sidebar.bmp`
- **Format**: Windows BMP
- **Size**: 55x55 pixels (Inno Setup small image)

## Generating Icons

If you don't have an `.ico` file yet, you can create one from a PNG:

### Using ImageMagick
```bash
magick convert one2lvos-logo.png -define icon:auto-resize=256,128,64,48,32,16 one2lvos.ico
```

### Online Tools
- https://convertico.com/
- https://www.icoconvert.com/

## Placeholder Assets

Until real assets are added, the installer will use default Windows icons. This is fine for testing but should be replaced for production builds.

## Asset Sources

- **Phase 9 logo**: Generate from the cosmic/galaxy theme
- **Color palette**: Use existing #8b5cf6 (purple) and #ec4899 (pink) gradient
- **Branding**: Match the web UI at http://localhost:8080