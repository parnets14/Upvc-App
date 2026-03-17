import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Platform,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import AppText from './AppText';
import axios from 'axios';
import {cleanVideoUrl} from '../utils/urlHelper';

const { width } = Dimensions.get('window');

const BuyerAdvertisements = ({ navigation }) => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [videoMuteStates, setVideoMuteStates] = useState({});

  // Helper function to construct proper media URLs
  const getMediaUrl = (mediaPath) => {
    if (!mediaPath) return null;
    // If path already includes 'uploads/', use as is
    if (mediaPath.startsWith('uploads/')) {
      return `https://upvcconnect.com/${mediaPath}`;
    }
    // Otherwise, add uploads/ prefix
    return `https://upvcconnect.com/uploads/${mediaPath}`;
  };

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      console.log('[BuyerAds] Fetching from:', 'https://upvcconnect.com/api/buyer/advertisements');
      const response = await axios.get(
        'https://upvcconnect.com/api/buyer/advertisements',
      );
      console.log('[BuyerAds] Response status:', response.status);
      console.log('[BuyerAds] Response data type:', typeof response.data);
      console.log('[BuyerAds] Response data keys:', response.data && typeof response.data === 'object' ? Object.keys(response.data) : 'NOT OBJECT');
      console.log('[BuyerAds] .advertisements:', response?.data?.advertisements?.length ?? 'undefined');
      console.log('[BuyerAds] .ads:', response?.data?.ads?.length ?? 'undefined');

      const ads = response?.data?.advertisements || response?.data?.ads || [];
      console.log('[BuyerAds] Final ads count:', ads.length);
      setAdvertisements(ads);
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      setError(err.message);
      console.error('[BuyerAds] Error fetching buyer advertisements:', err);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdvertisements();
  };

  const handleLike = async (adId) => {
    try {
      // You can implement user authentication and get userId here
      const userId = 'temp-user-id'; // Replace with actual user ID
      await axios.post(
        `https://upvcconnect.com/api/buyer/advertisements/${adId}/like`,
        { userId }
      );
      // Refresh advertisements to get updated like count
      fetchAdvertisements();
    } catch (error) {
      console.error('Error liking advertisement:', error);
    }
  };

  const renderAdvertisement = ({ item: ad }) => {
    const videoKey = `ad-${ad._id}`;
    const isMuted = videoMuteStates[videoKey] !== undefined 
      ? videoMuteStates[videoKey] 
      : (ad.defaultMuted !== undefined ? ad.defaultMuted : true);

    const toggleMute = () => {
      setVideoMuteStates(prev => ({
        ...prev,
        [videoKey]: !isMuted
      }));
    };

    return (
      <View style={styles.advertisementCard}>
        <LinearGradient
          colors={['#ffffff', '#ffffff']}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <AppText weight="Inter" style={styles.adTitle}>
                {ad.title}
              </AppText>
              {ad.isFeatured && (
                <View style={styles.featuredBadge}>
                  <AppText weight="Inter" style={styles.featuredText}>
                    FEATURED
                  </AppText>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => handleLike(ad._id)}>
              <Icon name="favorite" size={20} color="#ff4757" />
              <AppText weight="Inter" style={styles.likeCount}>
                {ad.likes || 0}
              </AppText>
            </TouchableOpacity>
          </View>

          <AppText weight="Inter" style={styles.adDescription}>
            {ad.description}
          </AppText>

          {ad.type === 'video' ? (
            <View style={styles.videoContainer}>
              <Video
                source={{
                  uri: cleanVideoUrl(getMediaUrl(ad.mediaUrl)),
                }}
                style={styles.video}
                resizeMode="cover"
                controls={true}
                muted={isMuted}
                paused={true}
                volume={isMuted ? 0.0 : 1.0}
                repeat={false}
                ignoreSilentSwitch="ignore"
                playWhenInactive={false}
                playInBackground={false}
                disableFocus={false}
                hideShutterView={true}
                shutterColor="transparent"
                showOnStart={true}
                tapAnywhereToPause={false}
                controlTimeout={3000}
                poster={ad.thumbnailUrl ? getMediaUrl(ad.thumbnailUrl) : undefined}
                onError={(error) => {
                  console.log('BuyerAdvertisements Video Error:', error);
                  console.log('Video URL:', getMediaUrl(ad.mediaUrl));
                }}
                onLoad={(data) => {
                  console.log('BuyerAdvertisements Video loaded successfully:', data);
                  console.log('Video URL:', getMediaUrl(ad.mediaUrl));
                }}
              />
              
              {/* Mute Button */}
              <View style={styles.videoControlsOverlay}>
                <TouchableOpacity
                  style={styles.muteButton}
                  onPress={toggleMute}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={isMuted ? "volume-off" : "volume-up"}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
              
              <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0)']}
                style={styles.videoOverlay}
                start={{ x: 0.5, y: 1 }}
                end={{ x: 0.5, y: 0 }}
              />
            </View>
          ) : (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: getMediaUrl(ad.mediaUrl) }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Sponsor Section */}
          {(ad.sponsorLogo || ad.sponsorText) && (
            <View style={styles.sponsorContainer}>
              <LinearGradient colors={['white', 'white']} style={styles.sponsorGradient}>
                <View style={styles.sponsorContent}>
                  {ad.sponsorLogo && (
                    <Image
                      source={{ uri: getMediaUrl(ad.sponsorLogo) }}
                      style={styles.sponsorLogo}
                      resizeMode="contain"
                    />
                  )}
                  {ad.sponsorText && (
                    <AppText weight="Inter" style={styles.sponsorText}>
                       {ad.sponsorText.toUpperCase()}
                    </AppText>
                  )}
                </View>
              </LinearGradient>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AppText style={styles.errorText}>
          Error loading advertisements: {error}
        </AppText>
        <TouchableOpacity onPress={fetchAdvertisements} style={styles.retryButton}>
          <AppText style={styles.retryText}>Retry</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText weight="Inter" style={styles.headerText}>
          FEATURED ADVERTISEMENTS
        </AppText>
        <AppText weight="Inter" style={styles.subHeaderText}>
          Discover the latest products and services from our partners
        </AppText>
      </View>

      <FlatList
        data={advertisements}
        renderItem={renderAdvertisement}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#000000']}
            tintColor={'#000000'}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerText: {
    fontSize: 18,
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  subHeaderText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  listContainer: {
    paddingHorizontal: 15,
  },
  advertisementCard: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardGradient: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
    marginRight: 15,
  },
  adTitle: {
    fontSize: 16,
    color: '#000',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  featuredBadge: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  featuredText: {
    fontSize: 10,
    color: '#000',
    fontWeight: 'bold',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
  },
  likeCount: {
    fontSize: 12,
    color: '#ff4757',
    marginLeft: 4,
  },
  adDescription: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 15,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    marginBottom: 10,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoControlsOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  muteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '30%',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  sponsorContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
  },
  sponsorGradient: {
    padding: 12,
    alignItems: 'center',
  },
  sponsorContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsorLogo: {
    width: 100,
    height: 40,
    marginBottom: 5,
  },
  sponsorText: {
    fontSize: 10,
    color: '#333',
    letterSpacing: 1,
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default BuyerAdvertisements;