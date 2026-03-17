# Firebase Installation Complete! ✅

## What Was Done

✅ Installed Firebase packages
✅ Configured Android build files
✅ Added google-services.json
✅ Added notification permission to AndroidManifest
✅ Cleaned Android build
✅ Backend Firebase Admin SDK installed

## Next Steps

### 1. Build and Run the App

```bash
# Make sure you're in the UPVC directory
cd UPVC

# Run the app
npx react-native run-android
```

### 2. Test Notifications

Once the app is running:

1. **Register as a seller** or **login**
2. The app will automatically:
   - Request notification permission
   - Get FCM token
   - Send token to backend
3. Check logs to see FCM token:
   ```
   LOG  FCM Token: ey...
   ```

### 3. Test from Admin Panel

1. Go to admin panel: http://localhost:3000/admin/sellers
2. Click "View (X/3)" on any seller's documents
3. Click "Approve" or "Reject" on a document
4. Seller should receive notification on their device!

## Troubleshooting

### If app doesn't build:

```bash
cd UPVC/android
./gradlew clean
cd ../..
npx react-native run-android
```

### If notifications don't work:

1. Check notification permission is granted
2. Look for FCM token in logs
3. Verify seller has FCM token in database
4. Check backend logs when approving/rejecting

### Clear cache if needed:

```bash
cd UPVC
npx react-native start --reset-cache
```

## Backend Setup

The backend is already configured! Just make sure:

1. Firebase Admin SDK is installed: ✅
2. `firebase-admin-key.json` is in `config/` folder: ✅
3. Backend server is running:
   ```bash
   cd UPVC_BACKEND_NEW
   npm start
   ```

## Testing Notification Manually

You can test sending a notification using this code in your backend:

```javascript
const { sendNotificationToDevice } = require('./utils/notificationHelper');

// Replace with actual FCM token from database
const fcmToken = 'seller_fcm_token_here';

await sendNotificationToDevice(
  fcmToken,
  'Test Notification',
  'This is a test message!',
  { type: 'test' }
);
```

## What Happens When Document is Approved/Rejected

1. Admin clicks Approve/Reject in admin panel
2. Backend updates document status in database
3. Backend sends notification to seller's FCM token
4. Seller receives notification:
   - **Approved**: "Your GST Certificate has been approved!"
   - **Rejected**: "Your GST Certificate has been rejected. Reason: [reason]"
5. Notification appears on seller's device (even if app is closed)

## Files Modified

### React Native App:
- ✅ `package.json` - Added Firebase dependencies
- ✅ `android/build.gradle` - Added Google Services plugin
- ✅ `android/app/build.gradle` - Added Firebase dependencies
- ✅ `android/app/google-services.json` - Firebase config
- ✅ `android/app/src/main/AndroidManifest.xml` - Added notification permission
- ✅ `App.jsx` - Added notification initialization
- ✅ `index.js` - Added background message handler
- ✅ `src/utils/NotificationService.js` - Created notification service
- ✅ `src/config/api.js` - Added FCM token endpoint

### Backend:
- ✅ `package.json` - Added firebase-admin
- ✅ `config/firebase-admin-key.json` - Service account key
- ✅ `config/firebase.js` - Firebase initialization
- ✅ `utils/notificationHelper.js` - Notification functions
- ✅ `models/Seller/Seller.js` - Added fcmToken field
- ✅ `controllers/Seller/sellerController.js` - Added notification sending
- ✅ `routes/Seller/sellerRoutes.js` - Added FCM token endpoint

## Ready to Go! 🚀

Everything is set up. Just run:

```bash
npx react-native run-android
```

And test by approving/rejecting documents from the admin panel!
