# Učimo srpski

Android language-learning app for Russian speakers learning Serbian.

## Current course build

- 45 learning modules across A1 (6), A2 (15), B1 (12), and B2 (12).
- Every topic module except the alphabet reference includes grammar and practice plus two interactive conversations and two comic stories.
- The A1 alphabet module is phonetics-only: all 30 Serbian letters in Cyrillic and Latin, uppercase/lowercase forms, audio letter names, IPA transcription, and Russian pronunciation hints. It has no dialogues or comics.
- The interface uses a playful, gamified design with XP, learning streaks, achievements, progress indicators, and the approved app icon.
- All four levels are currently open for review. Level transitions do not require exams; exams remain in the code but are temporarily hidden from the interface.
- Russian explanatory speech is kept separate from Serbian examples; Serbian sentences and dialogues are spoken using the Serbian voice.

## Android build

GitHub Actions builds a debug APK on pushes to `main` and by manual dispatch. The APK is uploaded as the `ucimo-srpski-debug-apk` workflow artifact.

## Voice

- Playback uses the Android Text-to-Speech service through `@capacitor-community/text-to-speech`.
- Serbian and Russian system voices are selected where available. Voice quality and availability depend on the TTS engine and installed language packs on the device.
- Speech exercises use native speech recognition. Android requests microphone permission only when the learner taps the microphone button.
- Text-to-speech playback itself does not need microphone permission.

## Branding

The Android launcher icon is generated from the selected Učimo srpski app icon in `assets/ucimo-srpski-icon.jpg`.

## Build source

`source/v5/index.html` is the canonical course HTML. The Android build injects the native audio bridge during the build and bundles `src/native-audio.js`.
