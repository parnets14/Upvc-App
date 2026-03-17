# Firebase Cloud Messaging (FCM) Setup Guide

## Overview
This guide explains how to set up Firebase Cloud Messaging for push notifications in the UPVC app.

## Features Implemented

✅ Firebase Cloud Messaging integration
✅ Push notifications for document approval/rejection
✅ Foreground and background notification handling
✅ FCM token management
✅ Notification channels for Android
✅ Backend notification sending via Firebase Admin SDK

## Installation Steps

### 1. Install Dependencies

```bash
cd UPVC
npm install @react-native-firebase/app @react-native-firebase/messaging react-native-push-notification
```

### 2. Android Configuration

The following files have been updated:

#### `android/build.gradle`
- Added Google Services plugin

#### `android/app/build.gradle`
- Added Firebase dependencies
- Applied Google Services plugin

#### `android/app/google-services.json`
- Added Firebase configuration file

### 3. Backend Setup

#### Install Firebase Admin SDK
```bash
cd UPVC_BACKEND_NEW
npm install firebase-admin
```

#### Files Created:
- `config/firebase-admin-key.json` - Firebase service account credentials
- `config/firebase.js` - Firebase Admin initialization
- `utils/notificationHelper.js` - Notification sending functions

## How It Works

### 1. App Initialization (App.jsx)

When the app starts:
1. Requests notification permission from user
2. Gets FCM token from Firebase
3. Sends FCM token to backend
4. Sets up listeners for:
   - Foreground notifications
   - Background notifications
   - Notification taps
   - Token refresh

### 2. Seller Registration

When a seller registers:
1. FCM token is stored in the seller's profile
2. Token is updated whenever it refreshes

### 3. Document Approval/Rejection

When admin approves/rejects a document:
1. Backend sends notification to seller's FCM token
2. Seller receives notification on their device
3. Notification includes:
   - Document type (GST Certificate, Visiting Card, Business Video)
   - Approval/Rejection status
   - Rejection reason (if rejected)

## Notification Types

### 1. Document Approved
```javascript
{
  title: "Document Approved",
  body: "Your GST Certificate has been approved!",
  data: {
    type: "document_approval",
    documentType: "gstCertificate"
  }
}
```

### 2. Document Rejected
```javascript
{
  title: "Document Rejected",
  body: "Your GST Certificate has been rejected. Reason: Document not clear",
  data: {
    type: "document_rejection",
    documentType: "gstCertificate",
    reason: "Document not clear"
  }
}
```

### 3. New Lead (Future)
```javascript
{
  title: "New Lead Received!",
  body: "You have a new lead from John Doe in Mumbai",
  data: {
    type: "new_lead",
    leadId: "lead_id",
    buyerName: "John Doe",
    city: "Mumbai"
  }
}
```

## API Endpoints

### Update FCM Token
```
POST /api/sellers/update-fcm-token
Authorization: Bearer <seller_token>

Body:
{
  "fcmToken": "device_fcm_token"
}
```

## Backend Usage

### Send Notification to Single Device
```javascript
const { sendNotificationToDevice } = require('./utils/notificationHelper');

await sendNotificationToDevice(
  fcmToken,
  'Notification Title',
  'Notification Body',
  { customData: 'value' }
);
```

### Send Document Approval Notification
```javascript
const { sendDocumentApprovalNotification } = require('./utils/notificationHelper');

await sendDocumentApprovalNotification(
  seller.fcmToken,
  'gstCertificate'
);
```

### Send Document Rejection Notification
```javascript
const { sendDocumentRejectionNotification } = require('./utils/notificationHelper');

await sendDocumentRejectionNotification(
  seller.fcmToken,
  'gstCertificate',
  'Document is not clear'
);
```

## Testing

### 1. Test Notification Permission
```javascript
import NotificationService from './src/utils/NotificationService';

const hasPermission = await NotificationService.requestUserPermission();
console.log('Has permission:', hasPermission);
```

### 2. Get FCM Token
```javascript
const fcmToken = await NotificationService.getFCMToken();
console.log('FCM Token:', fcmToken);
```

### 3. Send Test Notification from Backend
```javascript
const { sendNotificationToDevice } = require('./utils/notificationHelper');

await sendNotificationToDevice(
  'your_fcm_token_here',
  'Test Notification',
  'This is a test notification'
);
```

## Troubleshooting

### Issue: Notifications not received

**Solutions:**
1. Check if notification permission is granted
2. Verify FCM token is saved in database
3. Check Firebase Console for errors
4. Ensure google-services.json is in android/app/
5. Rebuild the app after adding Firebase

### Issue: Token not updating on server

**Solutions:**
1. Check if seller is logged in (token in AsyncStorage)
2. Verify API endpoint is correct
3. Check network connectivity
4. Look at backend logs for errors

### Issue: Foreground notifications not showing

**Solutions:**
1. Check if notification channel is created (Android)
2. Verify NotificationService.configure() is called
3. Check if local notification is being triggered

## Build Commands

### Clean Build (Recommended after Firebase setup)
```bash
cd UPVC/android
./gradlew clean
cd ..
npx react-native run-android
```

### iOS (if needed)
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

## Firebase Console

Access your Firebase project:
https://console.firebase.google.com/project/upvc-connect

### Useful Sections:
- **Cloud Messaging**: Send test notifications
- **Analytics**: View notification statistics
- **Settings > Service Accounts**: Download service account key

## Security Notes

⚠️ **Important:**
- Never commit `firebase-admin-key.json` to public repositories
- Add to `.gitignore`:
  ```
  config/firebase-admin-key.json
  android/app/google-services.json
  ```
- Use environment variables for production
- Rotate service account keys periodically

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Clean build: `cd android && ./gradlew clean`
3. ✅ Run app: `npx react-native run-android`
4. ✅ Test notification permission
5. ✅ Register as seller and get FCM token
6. ✅ Admin approves/rejects document
7. ✅ Verify notification received on device

## Support

For issues or questions:
- Check Firebase documentation: https://firebase.google.com/docs/cloud-messaging
- React Native Firebase: https://rnfirebase.io/
