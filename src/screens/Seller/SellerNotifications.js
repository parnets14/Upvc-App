import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppText from '../../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';

const SellerNotifications = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rejections, setRejections] = useState([]);
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    fetchRejections();
  }, []);

  const fetchRejections = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('sellerToken');
      if (!token) {
        navigation.replace('SellerLogin');
        return;
      }

      const response = await axios.get('https://upvcconnect.com/api/sellers', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const seller = response.data.seller;
        const rejectionList = [];

        // Check GST Certificate
        if (seller.gstCertificateStatus === 'rejected') {
          rejectionList.push({
            id: 'gstCertificate',
            title: 'GST Certificate',
            reason: seller.gstCertificateRejectionReason || 'Document rejected',
            type: 'document',
            icon: 'description',
          });
        }

        // Check Visiting Card
        if (seller.visitingCardStatus === 'rejected') {
          rejectionList.push({
            id: 'visitingCard',
            title: 'Visiting Card',
            reason: seller.visitingCardRejectionReason || 'Document rejected',
            type: 'document',
            icon: 'badge',
          });
        }

        // Check Business Profile Video
        if (seller.businessProfileVideoStatus === 'rejected') {
          rejectionList.push({
            id: 'businessProfileVideo',
            title: 'Business Profile Video',
            reason: seller.businessProfileVideoRejectionReason || 'Video rejected',
            type: 'video',
            icon: 'videocam',
          });
        }

        setRejections(rejectionList);
      }
    } catch (error) {
      console.error('Error fetching rejections:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRejections();
  };

  const handleReupload = async (rejection) => {
    try {
      if (rejection.type === 'video') {
        // Handle video reupload
        const result = await launchImageLibrary({
          mediaType: 'video',
          videoQuality: 'medium',
          durationLimit: 45,
        });

        if (result.didCancel) return;
        if (result.errorCode) {
          Alert.alert('Error', result.errorMessage || 'Failed to select video');
          return;
        }

        const selectedVideo = result.assets[0];
        if (selectedVideo.duration > 45000) {
          Alert.alert('Error', 'Video must be 45 seconds or less');
          return;
        }

        await uploadVideo(selectedVideo);
      } else {
        // Handle document reupload
        const result = await launchImageLibrary({
          mediaType: 'photo',
          quality: 0.8,
        });

        if (result.didCancel) return;
        if (result.errorCode) {
          Alert.alert('Error', result.errorMessage || 'Failed to select image');
          return;
        }

        const selectedImage = result.assets[0];
        await uploadDocument(rejection.id, selectedImage);
      }
    } catch (error) {
      console.error('Error reuploading:', error);
      Alert.alert('Error', 'Failed to reupload');
    }
  };

  const uploadVideo = async (video) => {
    try {
      setUploading({ businessProfileVideo: true });
      const token = await AsyncStorage.getItem('sellerToken');

      const formData = new FormData();
      formData.append('businessProfileVideo', {
        uri: video.uri,
        type: video.type || 'video/mp4',
        name: video.fileName || `business-video-${Date.now()}.mp4`,
      });

      const response = await axios.post(
        'https://upvcconnect.com/api/sellers/business-video',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Video uploaded successfully! Pending admin approval.');
        fetchRejections();
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert('Error', 'Failed to upload video');
    } finally {
      setUploading({});
    }
  };

  const uploadDocument = async (documentType, image) => {
    try {
      setUploading({ [documentType]: true });
      const token = await AsyncStorage.getItem('sellerToken');

      const formData = new FormData();
      formData.append(documentType, {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || `${documentType}-${Date.now()}.jpg`,
      });

      const response = await axios.put(
        'https://upvcconnect.com/api/sellers',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Document uploaded successfully! Pending admin approval.');
        fetchRejections();
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setUploading({});
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <AppText weight="Inter" style={styles.headerTitle}>
            Notifications
          </AppText>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <AppText weight="Inter" style={styles.headerTitle}>
          Notifications
        </AppText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#000']}
            tintColor="#000"
          />
        }
      >
        {rejections.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="notifications-none" size={64} color="#ccc" />
            <AppText weight="Inter" style={styles.emptyText}>
              No notifications
            </AppText>
            <AppText weight="Inter" style={styles.emptySubtext}>
              All your documents are approved or pending review
            </AppText>
          </View>
        ) : (
          rejections.map((rejection) => (
            <View key={rejection.id} style={styles.notificationCard}>
              <View style={styles.notificationHeader}>
                <View style={styles.iconContainer}>
                  <Icon name={rejection.icon} size={24} color="#FF3B30" />
                </View>
                <View style={styles.notificationContent}>
                  <AppText weight="Inter" style={styles.notificationTitle}>
                    {rejection.title} Rejected
                  </AppText>
                  <View style={styles.reasonContainer}>
                    <Icon name="info-outline" size={16} color="#666" />
                    <AppText weight="Inter" style={styles.reasonText}>
                      {rejection.reason}
                    </AppText>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.reuploadButton,
                  uploading[rejection.id] && styles.reuploadButtonDisabled,
                ]}
                onPress={() => handleReupload(rejection)}
                disabled={uploading[rejection.id]}
              >
                {uploading[rejection.id] ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Icon name="cloud-upload" size={20} color="#fff" />
                    <AppText weight="Inter" style={styles.reuploadButtonText}>
                      Reupload
                    </AppText>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
    marginBottom: 8,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    flex: 1,
    lineHeight: 20,
  },
  reuploadButton: {
    flexDirection: 'row',
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reuploadButtonDisabled: {
    backgroundColor: '#999',
  },
  reuploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SellerNotifications;
