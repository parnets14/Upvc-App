#!/bin/bash
# Script to customize the fresh Android folder with your app's settings

echo "Customizing Android folder for UPVC app..."

# 1. Copy app icons
echo "Copying app icons..."
cp -r android_backup/app/src/main/res/mipmap-* android/app/src/main/res/

# 2. Copy debug keystore
echo "Copying debug keystore..."
cp android_backup/app/debug.keystore android/app/

# 3. Update package name in AndroidManifest.xml
echo "Updating package name to com.upvc..."
sed -i '' 's/package="com.freshupvc"/package="com.upvc"/g' android/app/src/main/AndroidManifest.xml

# 4. Add permissions to AndroidManifest.xml
echo "Adding permissions..."
# This will be done manually - see instructions below

# 5. Update namespace in app/build.gradle
echo "Updating namespace..."
sed -i '' 's/namespace "com.freshupvc"/namespace "com.upvc"/g' android/app/build.gradle
sed -i '' 's/applicationId "com.freshupvc"/applicationId "com.upvc"/g' android/app/build.gradle

# 6. Update app name in strings.xml
echo "Updating app name..."
sed -i '' 's/<string name="app_name">FreshUPVC<\/string>/<string name="app_name">UPVC<\/string>/g' android/app/src/main/res/values/strings.xml

# 7. Rename Java/Kotlin package directories
echo "Renaming package directories..."
cd android/app/src/main/java/com
if [ -d "freshupvc" ]; then
    mv freshupvc upvc
fi
cd -

echo "Done! Now you need to:"
echo "1. Manually add permissions to android/app/src/main/AndroidManifest.xml"
echo "2. Update MainActivity and MainApplication package names"
echo "3. Run: cd android && ./gradlew clean"
