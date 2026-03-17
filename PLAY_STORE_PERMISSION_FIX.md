# Google Play Store Permission Fix

## Issue
Google Play rejected the app for using `READ_MEDIA_IMAGES` and `READ_MEDIA_VIDEO` permissions without demonstrating persistent access needs.

## Solution Applied

### 1. AndroidManifest.xml Changes
- Added explicit `tools:node="remove"` for all media permissions
- Added `READ_MEDIA_VISUAL_USER_SELECTED` removal
- Added SDK version limits to legacy storage permissions

### 2. Build Configuration
- Added manifest placeholders in `build.gradle` to exclude permissions
- This ensures permissions are removed at build time

### 3. Image Picker Configuration
- Created `ImagePickerConfig.js` utility with proper configurations
- All configurations use `presentationStyle: 'pageSheet'` to force Android Photo Picker
- Android Photo Picker (Android 13+) doesn't require permissions

## Steps to Verify and Resubmit

### Step 1: Clean Build
```bash
cd UPVC/android
./gradlew clean
cd ..
```

### Step 2: Generate Release Bundle
```bash
cd android
./gradlew bundleRelease
```

### Step 3: Verify Permissions in Bundle
After building, check the merged manifest:
```bash
# The merged manifest is in:
# android/app/build/intermediates/merged_manifests/release/AndroidManifest.xml
```

Look for these lines - they should NOT appear:
- `<uses-permission android:name="android.permission.READ_MEDIA_IMAGES"`
- `<uses-permission android:name="android.permission.READ_MEDIA_VIDEO"`

### Step 4: Test on Device
1. Install the release build on an Android 13+ device
2. Test image/video selection - it should use the system photo picker
3. Verify no permission dialogs appear for media access

### Step 5: Upload to Play Console
1. Upload the new AAB file
2. In the Play Console, go to "App content" → "App access"
3. Declare that your app uses the system photo picker for one-time access
4. Submit for review

## How It Works

### Android 13+ (API 33+)
- Uses Android Photo Picker API
- No permissions required
- User selects media through system UI
- App receives temporary URI access

### Android 12 and below
- Uses system gallery intent
- No persistent permissions needed
- One-time access to selected files

## Code Usage

Instead of manually configuring the image picker, use the utility:

```javascript
import { getPhotoPickerConfig, getVideoPickerConfig } from '../utils/ImagePickerConfig';
import { launchImageLibrary } from 'react-native-image-picker';

// For photos
const result = await launchImageLibrary(getPhotoPickerConfig());

// For videos
const result = await launchImageLibrary(getVideoPickerConfig({ durationLimit: 120 }));
```

## Additional Notes

- The app no longer requests camera permission (already removed)
- Location permissions are justified for the "Use Current Location" feature
- All changes comply with Google Play's photo/video permission policy
- The system picker provides a better user experience

## References
- [Android Photo Picker](https://developer.android.com/training/data-storage/shared/photopicker)
- [Google Play Photo/Video Policy](https://support.google.com/googleplay/android-developer/answer/9888170)
