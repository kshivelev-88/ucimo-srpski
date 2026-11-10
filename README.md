# Učimo srpski

Android test app for Russian speakers learning Serbian.

## Android build

GitHub Actions builds a debug APK on pushes to `main` and by manual dispatch. The APK is uploaded as the `ucimo-srpski-debug-apk` workflow artifact.

## Voice

- Playback uses the Android Text-to-Speech service through `@capacitor-community/text-to-speech`.
- Serbian and Russian system voices are selected where available. Voice quality and availability depend on the TTS engine and installed language packs on the device.
- Speech exercises use native speech recognition. Android requests microphone permission only when the learner taps the microphone button.
- Text-to-speech playback itself does not need microphone permission.

## Branding

The Android launcher icon is generated from the selected Učimo srpski app icon in `assets/ucimo-srpski-icon.jpg`.

## Current learning content

A1 and A2 lesson content is included. B1 and B2 remain curriculum roadmaps; their full lesson banks and exams are still to be authored.
