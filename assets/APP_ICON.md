Place your source app icon image at `assets/app-icon.png` (1024x1024 recommended), then run:

`powershell -ExecutionPolicy Bypass -File scripts/generate-app-icons.ps1 -Source assets/app-icon.png`

This will overwrite:
- Android: `android/app/src/main/res/mipmap-*/ic_launcher*.png`
- iOS: `ios/BPicker/Images.xcassets/AppIcon.appiconset/*.png`

