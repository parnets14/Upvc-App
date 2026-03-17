import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Share,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppText from '../../../../components/AppText';
import TopTabBar from '../../Dashboard/TopTabBar';
import {useNavigation} from '@react-navigation/native';
import PremiumLoginModal from '../../../../components/PremiumLoginModal';
import HamburgerMenu from '../HamburgerMenu';
import LinearGradient from 'react-native-linear-gradient';
import {cleanVideoUrl} from '../../../../utils/urlHelper';

const {width, height} = Dimensions.get('window');
const BASE_URL = 'https://upvcconnect.com/api/buyer/advertisements';

const TheProcess = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState('featured');
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [paused, setPaused] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('buyerToken');
      if (!token) {
        setShowLoginModal(true);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      let url = BASE_URL;
      if (activeTab !== 'featured') {
        url = `${BASE_URL}/${activeTab}`;
      }

      const [adsResponse, userResponse] = await Promise.all([
        axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get('https://upvcconnect.com/api/buyer', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      // Add safety checks for response data
      if (userResponse.data && userResponse.data.user && userResponse.data.user._id) {
        setUserId(userResponse.data.user._id);
      }
      
      console.log('[TheProcess] adsResponse.data:', JSON.stringify(adsResponse.data)?.substring(0, 300));
      console.log('[TheProcess] keys:', adsResponse.data ? Object.keys(adsResponse.data) : 'null');

      if (adsResponse.data && Array.isArray(adsResponse.data.advertisements)) {
        console.log('[TheProcess] ✅ Found ads via .advertisements, count:', adsResponse.data.advertisements.length);
        setAds(adsResponse.data.advertisements);
      } else if (adsResponse.data && Array.isArray(adsResponse.data.ads)) {
        console.log('[TheProcess] ✅ Found ads via .ads, count:', adsResponse.data.ads.length);
        setAds(adsResponse.data.ads);
      } else {
        console.warn('[TheProcess] ⚠️ No ads array found in response');
        setAds([]);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
      setAds([]);
      
      // Only show alert if it's not a network error during refresh
      if (!isRefreshing) {
        Alert.alert('Error', 'Failed to fetch advertisements. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const toggleLike = async adId => {
    try {
      if (!adId || !userId) {
        console.warn('Missing adId or userId for like toggle');
        return;
      }

      const token = await AsyncStorage.getItem('buyerToken');
      if (!token) {
        setShowLoginModal(true);
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/${adId}/like`,
        {userId},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Update ads state with safety checks
      setAds(prevAds =>
        prevAds.map(ad =>
          ad._id === adId
            ? {
                ...ad,
                likes: response.data.likes || ad.likes || 0,
                likedBy: response.data.isLiked
                  ? [...(ad.likedBy || []), userId]
                  : (ad.likedBy || []).filter(id => id !== userId),
              }
            : ad,
        ),
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      // Only show alert for non-network errors
      if (error.response && error.response.status !== 401) {
        Alert.alert('Error', 'Failed to like the post');
      }
    }
  };

    const handleShare = async (item) => {
      try {
        const shareOptions = {
          message: `${item.title}\n\n${item.description}\n\nCheck this out: ${item.type === 'video' 
            ? `https://upvcconnect.com/${item.mediaUrl}`
            : `https://upvcconnect.com/uploads/${item.mediaUrl}`
          }`,
        };
        await Share.share(shareOptions);
      } catch (error) {
        console.error('Error sharing ad:', error);
        Alert.alert('Error', 'Failed to share the post');
      }
    };

const getMediaUrl = (mediaUrl) => {
  if (!mediaUrl) return null;
  // Already a full URL (returned by toAbsoluteUrl on the server)
  if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
    return mediaUrl;
  }
  // Relative path — prepend base
  const clean = mediaUrl.replace(/^\/+/, '');
  if (clean.startsWith('uploads/')) {
    return `https://upvcconnect.com/${clean}`;
  }
  return `https://upvcconnect.com/uploads/${clean}`;
};

const renderItem = ({ item }) => {
  console.log('[TheProcess] renderItem mediaUrl:', item?.mediaUrl, '→', getMediaUrl(item?.mediaUrl));
  console.log('[TheProcess] renderItem sponsorLogo:', item?.sponsorLogo, '→', getMediaUrl(item?.sponsorLogo));

  // Add safety checks for item properties
  if (!item) {
    return null;
  }

  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <AppText weight="Inter" style={styles.postTitle}>
          {item.title || 'Untitled'}
        </AppText>
      </View>

      {item.type === 'video' && item.mediaUrl ? (
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: cleanVideoUrl(getMediaUrl(item.mediaUrl)) }}
            style={styles.video}
            resizeMode="contain"
            paused={paused}
            controls={true}
            onError={(error) => {
              console.error('[TheProcess] Video error:', error, 'url:', getMediaUrl(item.mediaUrl));
            }}
          />
        </View>
      ) : item.mediaUrl ? (
        <Image
          source={{ uri: getMediaUrl(item.mediaUrl) }}
          style={styles.image}
          resizeMode="cover"
          onError={(error) => {
            console.error('[TheProcess] Image error:', error.nativeEvent?.error, 'url:', getMediaUrl(item.mediaUrl));
          }}
        />
      ) : (
        <View style={[styles.image, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
          <Icon name="image" size={50} color="#ccc" />
          <AppText weight="Inter" style={{ color: '#999', marginTop: 10 }}>No media available</AppText>
        </View>
      )}

      <AppText weight="Inter" style={styles.postDescription}>
        {item.description || 'No description available'}
      </AppText>

      {true && (
        <View style={styles.sponsorContainer}>
          <LinearGradient colors={['white', 'white']} style={styles.sponsorGradient}>
            <View style={styles.sponsorContent}>
              {item.sponsorLogo ? (
                <Image
                  source={{ uri: getMediaUrl(item.sponsorLogo) }}
                  style={styles.sponsorLogo}
                  resizeMode="contain"
                  onError={(error) => {
                    console.error('[TheProcess] Sponsor logo error:', error.nativeEvent?.error, 'url:', getMediaUrl(item.sponsorLogo));
                  }}
                />
              ) : (
                <Image
                  source={require('../../../../assets/logo.png')}
                  style={styles.logo}
                />
              )}
               
                <AppText weight="Inter" style={styles.sponsorText}>
                   {item?.sponsorText?.toUpperCase() || "ELITE CREST"}
                </AppText>
             
            </View>
          </LinearGradient>
        </View>
      )}

      <View style={styles.postFooter}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleLike(item._id)}>
          <Icon
            name={
              item.likedBy?.includes(userId) ? 'favorite' : 'favorite-border'
            }
            size={24}
            color={item.likedBy?.includes(userId) ? 'red' : 'black'}
          />
          <AppText weight="Inter" style={styles.actionText}>
            {item.likes || 0}
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShare(item)}>
          <Icon name="share" size={22} color="black" />
          <AppText weight="Inter" style={styles.actionText}>
            Share
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};


  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="error-outline"
        size={50}
        color="#888"
        style={styles.emptyIcon}
      />
      <AppText weight="Inter" style={styles.emptyText}>
        No advertisements found
      </AppText>
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Icon name="refresh" size={20} color="white" />
        <AppText weight="Inter" style={styles.refreshText}>
          Try Again
        </AppText>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="black" />
        <AppText weight="Inter" style={styles.loadingText}>
          Loading advertisements...
        </AppText>
      </View>
    );
  }

  return (
   <View style={{paddingTop: insets.top, flex: 1, backgroundColor: 'white'}}> 
        <View style={styles.container}>
          <View style={styles.Headercontainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={30} color="#000" />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <Image
                source={require('../../../../assets/logo.png')}
                style={styles.logo}
              />
              {/* <View style={styles.menuContainer}> */}
                        {/* </View> */}
            </View>
                          <HamburgerMenu/>
          </View> 
      <TopTabBar /> 
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'featured' && styles.activeTab]}
          onPress={() => setActiveTab('featured')}>
          <AppText
            weight="SemiBold"
            style={[
              styles.tabText,
              activeTab === 'featured' && styles.activeTabText,
            ]}>
            FEATURED
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'latest' && styles.activeTab]}
          onPress={() => setActiveTab('latest')}>
          <AppText
            weight="SemiBold"
            style={[
              styles.tabText,
              activeTab === 'latest' && styles.activeTabText,
            ]}>
            LATEST
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'trending' && styles.activeTab]}
          onPress={() => setActiveTab('trending')}>
          <AppText
            weight="SemiBold"
            style={[
              styles.tabText,
              activeTab === 'trending' && styles.activeTabText,
            ]}>
            TRENDING
          </AppText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={ads}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={
          ads.length === 0 ? styles.emptyListContent : styles.listContent
        }
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#000000']}
            tintColor={'#000000'}
          />
        }
      />
      </View>
      <PremiumLoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        navigation={navigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // backgroundColor: 'white',
    // paddingBottom: 25,
     flex: 1,
    backgroundColor: '#FFFFFF',
  },
  Headercontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    // width: '100%',
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
    backgroundColor: 'white',
    zIndex: 1,
  },
  backButton: {
    // marginRight: 10,
    padding: 5,
    // width: 40,
    // alignItems: 'flex-start',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 50,
    // resizeMode: 'contain',
  },
  menuContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: 'black',
  },
  tabText: {
    fontSize: 12,
    color: '#888',
    letterSpacing: 2,
  },
  activeTabText: {
    color: 'black',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyListContent: {
    flex: 1,
  },
  postContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  postTitle: {
    textAlign: 'center',
    fontSize: 18,
    color: 'black',
    flex: 1,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  postDescription: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
    lineHeight: 20,
    textAlign: 'center',
  },
    sponsorContainer: {
    width: '90%',
    borderRadius: 10,
    overflow: 'hidden',
    shadowRadius: 4,
  },
  sponsorGradient: {
    padding: 15,
    alignItems: 'center',
  },
  sponsorContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsorLogo: {
    width: 120,
    height: 50,
  },
  sponsorText: {
    fontSize: 12,
    color: '#333',
    letterSpacing: 1.5,
    marginTop: 8,
    fontWeight: '600',
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: 'black',
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 500,
    paddingTop: 100,
  },
  emptyIcon: {
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'black',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  refreshText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
});

export default TheProcess;
