# Google Play Photo/Video Permission Fix

## Issue
Google Play rejected the app for including `READ_MEDIA_IMAGES` and `READ_MEDIA_VIDEO` permissions without proper justification.

## What Was Changed

### 1. AndroidManifest.xml
- Added `android:maxSdkVersion="32"` to storage permissions
- This tells Google Play we don't need these permissions on Android 13+ devices
- Kept `tools:node="remove"` to prevent library permissions from being merged

### 2. build.gradle
- Already configured to use Photo Picker via `manifestPlaceholders`
- Added verification task to ensure permissions are removed

## Steps to Submit New Version

### 1. Clean Build
```bash
cd android
./gradlew clean
cd ..
```

### 2. Build Release Bundle
```bash
cd android
./gradlew bundleRelease
```

The AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

### 3. Verify Permissions (Important!)
Before uploading, verify the permissions in your AAB:

```bash
# Extract the manifest from the AAB
cd android/app/build/outputs/bundle/release
unzip -p app-release.aab base/manifest/AndroidManifest.xml > manifest.xml

# Check for unwanted permissions (should NOT appear)
grep -i "READ_MEDIA" manifest.xml
grep -i "READ_EXTERNAL_STORAGE" manifest.xml
```

If these commands return nothing, you're good to go!

### 4. Upload to Google Play Console
1. Go to Google Play Console
2. Navigate to your app → Production → Create new release
3. Upload the new AAB (version code 16)
4. In the release notes, mention: "Fixed photo/video permission usage to comply with Google Play policy"

### 5. Update Data Safety Form (CRITICAL!)

In Google Play Console, go to: **App content → Data safety**

For "Photos and videos" access:
- Select: "Yes, this app accesses photos and videos"
- Purpose: "App functionality" (or whatever applies to your use case)
- Data handling: "Ephemeral" (data is not stored permanently)
- Important: Add this explanation:

```
This app uses the Android Photo Picker (Android 13+) and ACTION_PICK intent (Android 12 and below) 
for one-time photo/video selection. No persistent storage permissions are required or requested. 
Users select media through the system picker, and the app only accesses the specific files chosen 
by the user for upload purposes.
```

### 6. Declaration Form (if prompted)
If Google asks for a permissions declaration form:
- Declare that you use "Photo Picker" or "System Picker"
- Explain: "One-time media selection for user uploads"
- Mention: "No background access, no persistent storage"

## Technical Details

### How It Works
- **Android 13+ (API 33+)**: Uses Android Photo Picker (no permissions needed)
- **Android 12 and below**: Uses `ACTION_PICK` intent (no permissions needed)
- The `react-native-image-picker` library handles this automatically when configured correctly

### Why This Fixes the Issue
1. Permissions are explicitly removed with `tools:node="remove"`
2. `maxSdkVersion="32"` tells Google Play we don't need permissions on modern devices
3. Photo Picker is enabled via `manifestPlaceholders`
4. Your code already uses the correct API calls

## Verification Checklist
- [ ] Clean build completed
- [ ] New AAB generated with version code 16
- [ ] Verified no READ_MEDIA permissions in manifest
- [ ] Uploaded to Google Play Console
- [ ] Updated Data Safety form
- [ ] Submitted for review

## If Still Rejected
If Google still rejects after these changes:
1. Check the merged manifest in the AAB (step 3 above)
2. Ensure no other libraries are adding these permissions
3. Contact Google Play support with this explanation:
   - "App uses Android Photo Picker and system intents only"
   - "No persistent media permissions required"
   - "Permissions explicitly removed from manifest"
