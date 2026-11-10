# Učimo srpski

Android-ready Capacitor wrapper around the current unified web prototype.

## Build APK with GitHub Actions

The workflow `.github/workflows/build-apk.yml` runs on pushes to `main` and can also be started manually from the Actions tab. It installs Node.js and Java, creates the native Android project if needed, synchronizes Capacitor, builds a debug APK, and uploads it as the `ucimo-srpski-debug-apk` artifact.

## Current prototype scope

- Unified A1/A2 lesson presentation and current lesson content.
- Russian and Serbian speech using device/browser speech synthesis (available voices depend on the device).
- B1/B2 currently contain curriculum roadmaps, not complete lesson banks.

## Install the debug build

Download `app-debug.apk` from the successful GitHub Actions run artifact and install it on an Android device. Android may ask to allow installation from the browser or file manager.
