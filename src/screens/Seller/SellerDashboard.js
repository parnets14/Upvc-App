import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  Animated,
  Alert,
  RefreshControl,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import AppText from '../../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import PermissionManager, { PermissionContext, PermissionStatus } from '../../utils/PermissionManager';
import PermissionStatusIndicator from '../../components/PermissionStatusIndicator';
import PermissionSettings from '../../components/Seller/PermissionSettings';
import SellerNotificationBell from '../../components/Seller/SellerNotificationBell';

const { width } = Dimensions.get('window');

const SellerHome = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [hasVideo, setHasVideo] = useState(false);
  const [videoUri, setVideoUri] = useState(null); 
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPermissionSettings, setShowPermissionSettings] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(PermissionStatus.NOT_REQUESTED);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const videoRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Check if seller already has a video
    checkExistingVideo();
    
    // Check permission status
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const status = await PermissionManager.getPermissionStatus();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking permission status:', error);
    }
  };

  // Cleanup effect to pause video when component unmounts
  useEffect(() => {
    return () => {
      // Pause video when component unmounts
      if (videoRef.current && isPlaying) {
        setIsPlaying(false);
        setShowThumbnail(true);
      }
    };
  }, [isPlaying]);

  // Pause video when screen loses focus
  useFocusEffect(
    React.useCallback(() => {
      // Screen is focused - video can play
      return () => {
        // Screen is losing focus - pause video
        if (videoRef.current && isPlaying) {
          setIsPlaying(false);
          setShowThumbnail(true);
        }
      };
    }, [isPlaying])
  );

  useEffect(() => {
    // Animate progress bar when uploadProgress changes
    if (isUploading) {
      Animated.timing(progressAnim, {
        toValue: uploadProgress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [uploadProgress, isUploading]);

  useFocusEffect(
    React.useCallback(() => {
      // Pause video when screen is focused (in case it was playing from previous focus)
      if (videoRef.current) {
        videoRef.current.seek(0);
      }
      
      return () => {
        // Pause video when screen loses focus
        if (videoRef.current) {
          videoRef.current.seek(0);
        }
      };
    }, [])
  );

  const checkExistingVideo = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('sellerToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await axios.get('https://upvcconnect.com/api/sellers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success && response.data.seller.businessProfileVideo) {
        setHasVideo(true);
        const rawPath = response.data.seller.businessProfileVideo;
        // Normalize: ensure path starts with /uploads/
        const normalizedPath = rawPath.startsWith('http')
          ? rawPath
          : `https://upvcconnect.com${rawPath.startsWith('/') ? rawPath : '/uploads/' + rawPath}`;
        setVideoUri(normalizedPath);
      } else {
        setHasVideo(false);
        setVideoUri(null);
      }
    } catch (error) {
      console.error('Error checking existing video:', error);
      setHasVideo(false);
      setVideoUri(null);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    checkExistingVideo();
  };

  // Toggle mute/unmute function
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Video event handlers
  const onVideoLoad = () => {
    console.log('Video loaded');
    setShowThumbnail(true);
    setIsPlaying(false);
  };

  const onVideoEnd = () => {
    console.log('Video ended');
    setShowThumbnail(true); // Show thumbnail when video ends
    setIsPlaying(false);
  };

  const onVideoPlay = () => {
    console.log('Video playing');
    setShowThumbnail(false); // Hide thumbnail when playing
    setIsPlaying(true);
  };

  const onVideoPause = () => {
    console.log('Video paused');
    setShowThumbnail(true); // Show thumbnail when paused
    setIsPlaying(false);
  };

  // Handle thumbnail tap to play video
  const handleThumbnailPress = () => {
    if (videoRef.current) {
      videoRef.current.seek(0); // Reset to beginning
      setIsPlaying(true);
      setShowThumbnail(false);
    }
  };

  // Pause video function
  const pauseVideo = () => {
    setIsPlaying(false);
    setShowThumbnail(true);
  };

  const selectVideo = async () => {
    try {
      // Using Android Photo Picker - no permissions needed
      // This addresses Google Play Store policy requirements
      await PermissionManager.logPermissionRequest(
        'video', 
        PermissionContext.VIDEO_UPLOAD, 
        'photo_picker_initiated', 
        'seller_dashboard'
      );

      const result = await launchImageLibrary({
        mediaType: 'video',
        videoQuality: 'medium',
        durationLimit: 45, // 45 seconds max
        // Use Android Photo Picker when available (Android 13+)
        presentationStyle: 'pageSheet',
      });

      if (result.didCancel) {
        await PermissionManager.logPermissionRequest(
          'video', 
          PermissionContext.VIDEO_UPLOAD, 
          'video_selection_cancelled', 
          'seller_dashboard'
        );
        return null;
      }
      
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to select video');
        await PermissionManager.logPermissionRequest(
          'video', 
          PermissionContext.VIDEO_UPLOAD, 
          'video_selection_error', 
          'seller_dashboard'
        );
        return null;
      }

      const selectedVideo = result.assets[0];
      if (selectedVideo.duration > 45000) { // 45 seconds in ms
        Alert.alert('Error', 'Video must be 45 seconds or less');
        return null;
      }

      await PermissionManager.logPermissionRequest(
        'video', 
        PermissionContext.VIDEO_UPLOAD, 
        'video_selected_photo_picker', 
        'seller_dashboard'
      );

      return selectedVideo;
    } catch (error) {
      console.error('Error selecting video:', error);
      Alert.alert('Error', 'Failed to select video');
      await PermissionManager.logPermissionRequest(
        'video', 
        PermissionContext.VIDEO_UPLOAD, 
        'video_selection_error', 
        'seller_dashboard'
      );
      return null;
    }
  };

  const handleUpload = async () => {
    try {
      // With Android Photo Picker, no permission checks needed
      const selectedVideo = await selectVideo();
      if (!selectedVideo) return;

      setIsUploading(true);
      setUploadProgress(0);
      const token = await AsyncStorage.getItem('sellerToken'); 
      if (!token) {
        Alert.alert('Please Login');
        return;
      }

      const formData = new FormData();
      formData.append('businessProfileVideo', {
        uri: selectedVideo.uri,
        type: selectedVideo.type || 'video/mp4',
        name: selectedVideo.fileName || `business-video-${Date.now()}.mp4`,
      });

      const response = await axios.post(
        'https://upvcconnect.com/api/sellers/business-video',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(Math.min(percentCompleted, 100)); // Ensure max 100%
            }
          },
        }
      );

      if (response.data.success) {
        setHasVideo(true);
        setVideoUri(`https://upvcconnect.com${response.data.videoUrl}`);
        Alert.alert('Success', 'Video uploaded successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to upload video');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert('Error', error.message || 'Failed to upload video');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePermissionChange = (newStatus) => {
    setPermissionStatus(newStatus);
    setShowPermissionSettings(false);
    
    if (newStatus === PermissionStatus.GRANTED) {
      // Trigger video upload after permission is granted
      setTimeout(() => {
        handleUpload();
      }, 500);
    }
  };

  const renderVideoSection = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <AppText weight='Inter' style={styles.loadingText}>Loading video...</AppText>
        </View>
      );
    }

    return (
      <>
        {hasVideo && videoUri ? (
          <View style={styles.videoContainer}>
            <Video
              ref={videoRef}
              source={{ uri: videoUri }}
              style={styles.videoPlayer}
              resizeMode="cover"
              controls={true}
              paused={!isPlaying}
              muted={isMuted}
              ignoreSilentSwitch="obey"
              onLoad={onVideoLoad}
              onEnd={onVideoEnd}
              onPlay={onVideoPlay}
              onPause={onVideoPause}
            />
            {/* Thumbnail overlay */}
            {showThumbnail && (
              <TouchableOpacity 
                style={styles.thumbnailOverlay}
                onPress={handleThumbnailPress}
                activeOpacity={0.8}
              >
                <Icon name="play-circle-filled" size={60} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            )}
            <View style={styles.videoBadge}>
              <Icon name="check-circle" size={16} color="#4CAF50" />
              <AppText weight='Inter' style={styles.videoBadgeText}>UPLOADED</AppText>
            </View>
            <TouchableOpacity 
              style={styles.muteButton} 
              onPress={toggleMute}
            >
              <Icon 
                name={isMuted ? "volume-off" : "volume-up"} 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadPlaceholder}
            onPress={handleUpload}
            disabled={isUploading}
          > 
            <View style={styles.uploadOverlay}>
              <Icon name="videocam" size={40} color="black" />
              <AppText weight='Inter' style={styles.uploadText}>
                {isUploading ? 'Uploading...' : 'Upload Your Video'}
              </AppText>
              {permissionStatus !== PermissionStatus.GRANTED && (
                <AppText weight='Inter' style={styles.permissionHint}>
                  Tap to grant video permissions
                </AppText>
              )}
            </View>
          </TouchableOpacity>
        )}

        {isUploading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  }
                ]}
              />
            </View>
            <AppText weight='Inter' style={styles.progressText}>
              {uploadProgress}%
            </AppText>
          </View>
        )}
        
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.actionButton, styles.uploadButton]}
            onPress={handleUpload}
            disabled={isUploading}
          >
            <Icon name="cloud-upload" size={20} color="#fff" />
            <AppText weight='Inter' style={styles.buttonText}>
              {isUploading ? 'UPLOADING...' : hasVideo ? 'RE-UPLOAD' : 'UPLOAD'}
            </AppText>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <View style={{ paddingTop: insets.top, flex: 1, backgroundColor: 'white' }}>
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#000000']}
              tintColor={'#000000'}
            />
          }
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} />
            <SellerNotificationBell navigation={navigation} />
          </View>
          <View style={styles.headerCard}>
            <AppText weight='Inter' style={styles.headerTitle}>
              We generate qualified leads and share with select fabricators.
            </AppText>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <AppText weight='Inter' style={styles.sectionTitle}>DO THIS RIGHT AWAY!</AppText>
              <PermissionStatusIndicator 
                size="small"
                onPress={() => setShowPermissionSettings(true)}
              />
            </View>
            <AppText weight='Inter' style={styles.sectionDescription}>
              Upload a short video (max 45 sec) showcasing your infrastructure,
              client testimonials, installations, or showroom to build trust with
              buyers.
            </AppText>
          </View>
          
          <View style={styles.sectionCard2}>
            <AppText weight='Inter' style={styles.sectionTitle}>Showcase Video</AppText>
            {renderVideoSection()}
          </View>
        </ScrollView>
      </Animated.View>
      
      {/* Permission Settings Modal */}
      {showPermissionSettings && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <AppText weight='Inter' style={styles.modalTitle}>Video Permissions</AppText>
              <TouchableOpacity 
                onPress={() => setShowPermissionSettings(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <PermissionSettings 
              userId="seller_dashboard"
              onPermissionChange={handlePermissionChange}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingBottom: 50,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  logo: {
    width: 100,
    height: 50,
    resizeMode: 'contain',
  },
  headerCard: {
    padding: 20,
    paddingTop: 0,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    color: '#000',
    lineHeight: 28,
    textAlign: "center"
  },
  videoContainer: {
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    aspectRatio: 5 / 9,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 15,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  videoBadgeText: {
    fontSize: 12,
    color: '#000',
    marginLeft: 4,
  },
  muteButton: {
    position: 'absolute',
    bottom: 12,
    right: 100, // Move to left side to avoid all right-side controls
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensure it's above video controls
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  uploadPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  uploadOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  uploadText: {
    color: 'black',
    fontSize: 16,
    marginTop: 12,
  },
  permissionHint: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  progressBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 3,
  },
  progressText: {
    color: '#000',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionCard2: {
    margin: 16,
    padding: 5,
    borderRadius: 16,
    marginBottom: 50,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#111',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: "center"
  },
  sectionDescription: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  uploadButton: {
    backgroundColor: '#000',
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  loadingContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginTop: 15,
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
});

export default SellerHome;

// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Dimensions,
//   Image,
//   Animated,
//   Alert,
//   AppState,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import Video from 'react-native-video';
// import AppText from '../../components/AppText';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import { launchImageLibrary } from 'react-native-image-picker';
// import { useFocusEffect } from '@react-navigation/native';

// const { width } = Dimensions.get('window');

// const SellerHome = () => {
//   const insets = useSafeAreaInsets();
//   const [hasVideo, setHasVideo] = useState(false);
//   const [videoUri, setVideoUri] = useState(null); 
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(0.9)).current;
//   const videoRef = useRef(null);
//   const progressAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         friction: 4,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     // Check if seller already has a video
//     checkExistingVideo();
//   }, []);

//   useEffect(() => {
//     // Animate progress bar when uploadProgress changes
//     if (isUploading) {
//       Animated.timing(progressAnim, {
//         toValue: uploadProgress,
//         duration: 300,
//         useNativeDriver: false,
//       }).start();
//     }
//   }, [uploadProgress, isUploading]);

//   useFocusEffect(
//     React.useCallback(() => {
//       // Pause video when screen is focused (in case it was playing from previous focus)
//       if (videoRef.current) {
//         videoRef.current.seek(0);
//       }
      
//       return () => {
//         // Pause video when screen loses focus
//         if (videoRef.current) {
//           videoRef.current.seek(0);
//         }
//       };
//     }, [])
//   );

//   const checkExistingVideo = async () => {
//     try {
//       const token = await AsyncStorage.getItem('sellerToken');
//       if (!token) return;

//       const response = await axios.get('https://upvcconnect.com/api/sellers', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       console.log("response data : ", response.data)
//       if (response.data.success && response.data.seller.businessProfileVideo) {
//         setHasVideo(true);
//         setVideoUri(`https://upvcconnect.com${response.data.seller.businessProfileVideo}`);
//       }
//     } catch (error) {
//       console.error('Error checking existing video:', error);
//     }
//   };

//   const selectVideo = async () => {
//     try {
//       const result = await launchImageLibrary({
//         mediaType: 'video',
//         videoQuality: 'medium',
//         durationLimit: 45, // 45 seconds max
//       });

//       if (result.didCancel) return;
//       if (result.errorCode) {
//         Alert.alert('Error', result.errorMessage || 'Failed to select video');
//         return;
//       }

//       const selectedVideo = result.assets[0];
//       if (selectedVideo.duration > 45000) { // 45 seconds in ms
//         Alert.alert('Error', 'Video must be 45 seconds or less');
//         return;
//       }

//       return selectedVideo;
//     } catch (error) {
//       console.error('Error selecting video:', error);
//       Alert.alert('Error', 'Failed to select video');
//       return null;
//     }
//   };

//   const handleUpload = async () => {
//     try {
//       const selectedVideo = await selectVideo();
//       if (!selectedVideo) return;

//       setIsUploading(true);
//       setUploadProgress(0);
//       const token = await AsyncStorage.getItem('sellerToken'); 
//       if (!token) {
//         Alert.alert('Please Login');
//         return;
//       }

//       const formData = new FormData();
//       formData.append('businessProfileVideo', {
//         uri: selectedVideo.uri,
//         type: selectedVideo.type || 'video/mp4',
//         name: selectedVideo.fileName || `business-video-${Date.now()}.mp4`,
//       });

//       const response = await axios.post(
//         'https://upvcconnect.com/api/sellers/business-video',
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//             Authorization: `Bearer ${token}`,
//           },
//           onUploadProgress: (progressEvent) => {
//             const percentCompleted = Math.round(
//               (progressEvent.loaded * 100) / progressEvent.total
//             );
//             setUploadProgress(percentCompleted);
//           },
//         }
//       );

//       if (response.data.success) {
//         setHasVideo(true);
//         setVideoUri(`https://upvcconnect.com${response.data.videoUrl}`);
//         Alert.alert('Success', 'Video uploaded successfully!');
//       } else {
//         throw new Error(response.data.message || 'Failed to upload video');
//       }
//     } catch (error) {
//       console.error('Error uploading video:', error);
//       Alert.alert('Error', error.message || 'Failed to upload video');
//     } finally {
//       setIsUploading(false);
//       setUploadProgress(0);
//     }
//   };

//   return (
//     <View style={{ paddingTop: insets.top, flex: 1, backgroundColor: 'white' }}>
//       <Animated.View
//         style={[
//           styles.container,
//           { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
//         ]}>
//         <ScrollView contentContainerStyle={styles.scrollContainer}>
//           {/* Header Section */}
//           <Image source={require('../../assets/logo.png')} style={styles.logo} />
//           <View style={styles.headerCard}>
//             <AppText weight='Inter' style={styles.headerTitle}>
//               We generate qualified leads and share with select fabricators.
//             </AppText>
//           </View>

//           <View style={styles.sectionCard}>
//             <AppText weight='Inter' style={styles.sectionTitle}>DO THIS RIGHT AWAY!</AppText>
//             <AppText weight='Inter' style={styles.sectionDescription}>
//               Upload a short video (max 45 sec) showcasing your infrastructure,
//               client testimonials, installations, or showroom to build trust with
//               buyers.
//             </AppText>
//           </View>
//           <View style={styles.sectionCard2}>
//             <AppText weight='Inter' style={styles.sectionTitle}>Showcase Video</AppText>

//             {hasVideo && videoUri ? (
//               <View style={styles.videoContainer}>
//                 <Video
//                   ref={videoRef}
//                   source={{ uri: videoUri }}
//                   style={styles.videoPlayer}
//                   resizeMode="cover"
//                   controls={true}
//                   paused={false}
//                   ignoreSilentSwitch="obey"
//                 />
//                 <View style={styles.videoBadge}>
//                   <Icon name="check-circle" size={16} color="#4CAF50" />
//                   <AppText weight='Inter' style={styles.videoBadgeText}>UPLOADED</AppText>
//                 </View>
//               </View>
//             ) : (
//               <TouchableOpacity
//                 style={styles.uploadPlaceholder}
//                 onPress={handleUpload}
//                 disabled={isUploading}> 
//                 <View style={styles.uploadOverlay}>
//                   <Icon name="videocam" size={40} color="black" />
//                   <AppText weight='Inter' style={styles.uploadText}>
//                     {isUploading ? 'Uploading...' : 'Upload Your Video'}
//                   </AppText>
                  
//                 </View>
//               </TouchableOpacity>
//             )}

//             {isUploading && (
//               <View style={styles.progressContainer}>
//                 <View style={styles.progressBackground}>
//                   <Animated.View 
//                     style={[
//                       styles.progressBar,
//                       {
//                         width: progressAnim.interpolate({
//                           inputRange: [0, 100],
//                           outputRange: ['0%', '100%'],
//                         }),
//                       }
//                     ]}
//                   />
//                 </View>
//                 <AppText weight='Inter' style={styles.progressText}>
//                   {uploadProgress}%
//                 </AppText>
//               </View>
//             )}
//             <View style={styles.buttonGroup}>
//               <TouchableOpacity
//                 style={[styles.actionButton, styles.uploadButton]}
//                 onPress={handleUpload}
//                 disabled={isUploading}>
//                 <Icon name="cloud-upload" size={20} color="#fff" />
//                 <AppText weight='Inter' style={styles.buttonText}>
//                   {isUploading ? 'UPLOADING...' : hasVideo ? 'RE-UPLOAD' : 'UPLOAD'}
//                 </AppText>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </ScrollView>
//       </Animated.View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   scrollContainer: {
//     paddingBottom: 50,
//   },
//   logo: {
//     alignSelf: 'center',
//     width: 100,
//     height: 50,
//     resizeMode: 'contain',
//   },
//   headerCard: {
//     padding: 20,
//     paddingTop: 0,
//     borderRadius: 12,
//   },
//   headerTitle: {
//     fontSize: 18,
//     color: '#000',
//     lineHeight: 28,
//     textAlign: "center"
//   },
//   videoContainer: {
//     borderRadius: 12,
//     marginBottom: 16,
//     backgroundColor: '#000',
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: '100%',
//     aspectRatio: 11 / 16,
//     borderRadius: 10,
//     overflow: 'hidden',
//     marginTop: 15,
//   },
//   videoPlayer: {
//     width: '100%',
//     height: '100%',
//   },
//   videoBadge: {
//     position: 'absolute',
//     top: 12,
//     right: 12,
//     backgroundColor: 'rgba(255,255,255,0.9)',
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//   },
//   videoBadgeText: {
//     fontSize: 12,
//     color: '#000',
//     marginLeft: 4,
//   },
//   uploadPlaceholder: {
//     width: '100%',
//     height: width * 1,
//     borderRadius: 12,
//     overflow: 'hidden',
//     marginBottom: 16,
//     backgroundColor: '#f0f0f0',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   uploadOverlay: {
//     position: 'absolute',
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: '100%',
//     height: '100%',
//   },
//   uploadText: {
//     color: 'black',
//     fontSize: 16,
//     marginTop: 12,
//     marginBottom: 20,
//   },
//   progressContainer: {
//     width: '80%',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   progressBackground: {
//     width: '100%',
//     height: 6,
//     backgroundColor: '#e0e0e0',
//     borderRadius: 3,
//     overflow: 'hidden',
//   },
//   progressBar: {
//     height: '100%',
//     backgroundColor: '#000',
//     borderRadius: 3,
//   },
//   progressText: {
//     color: '#000',
//     fontSize: 12,
//     marginTop: 8,
//     fontWeight: '600',
//   },
//   buttonGroup: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   actionButton: {
//     flex: 1,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//     borderRadius: 8,
//     marginHorizontal: 4,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 14,
//     marginLeft: 8,
//     letterSpacing: 0.5,
//   },
//   sectionCard: {
//     backgroundColor: '#fff',
//     margin: 16,
//     padding: 20,
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   sectionCard2: {
//     margin: 16,
//     padding: 5,
//     borderRadius: 16,
//     marginBottom: 50,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     color: '#111',
//     marginBottom: 10,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//     textAlign: "center"
//   },
//   sectionDescription: {
//     fontSize: 14,
//     color: '#444',
//     lineHeight: 22,
//   },
//   uploadButton: {
//     backgroundColor: '#000',
//     flexDirection: 'row',
//     padding: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 12,
//     flex: 1,
//     marginRight: 6,
//   },
// });

// export default SellerHome;