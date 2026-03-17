# Google Play Media Permission Fix

## Problem
Google Play rejected the app for using `READ_MEDIA_IMAGES` and `READ_MEDIA_VIDEO` permissions without core functionality requiring persistent media access.

## Solution Applied

### 1. Updated AndroidManifest.xml
- Removed `maxSdkVersion` attributes from permission removals to ensure they're blocked on all Android versions
- Added clear documentation about using Android Photo Picker

### 2. Updated build.gradle
- Incremented versionCode to 14 and versionName to 1.0.1
- Removed old manifestPlaceholders
- Added proper configuration for Photo Picker usage

### 3. Updated gradle.properties
- Added `RNImagePicker_UsePhotoPicker=true` to force react-native-image-picker to use Android Photo Picker

## How It Works

### Android 13+ (API 33+)
- Uses Android Photo Picker (no permissions required)
- User selects media through system UI
- App receives temporary URI access

### Android 12 and below (API < 33)
- Uses `ACTION_PICK` intent (no permissions required)
- Falls back to system gallery picker
- App receives temporary URI access

## Build Instructions

1. Clean the project:
```bash
cd android
./gradlew clean
cd ..
```

2. Build release APK/AAB:
```bash
cd android
./gradlew bundleRelease
```

3. The AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

## Verification

After building, verify permissions in the manifest:
```bash
# Extract and check merged manifest
cd android/app/build/intermediates/merged_manifests/release/
cat AndroidManifest.xml | grep -i "READ_MEDIA"
```

You should see NO results (permissions successfully removed).

## Testing

Test on devices with different Android versions:
- Android 13+: Should use Photo Picker
- Android 12-: Should use gallery picker
- Both should work without requesting permissions

## Upload to Google Play

1. Build the release AAB
2. Upload to Google Play Console
3. The media permissions should no longer appear in the permission list
4. Submit for review

## Important Notes

- Do NOT add back READ_MEDIA_IMAGES or READ_MEDIA_VIDEO permissions
- The app uses temporary URI access which is sufficient for one-time media selection
- This complies with Google Play's policy on photo/video permissions
