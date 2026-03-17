import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  RefreshControl,
} from 'react-native';
import Video from 'react-native-video';
import TopTabBar from '../../Dashboard/TopTabBar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AppText from '../../../../components/AppText';
import axios from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import HamburgerMenu from '../HamburgerMenu';

const { width, height } = Dimensions.get('window');

const Price = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  const [videoData, setVideoData] = useState(null);
  const [headingData, setHeadingData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [pageContent, setPageContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Economy');
  const [isSticky, setIsSticky] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(true);
  const [videoError, setVideoError] = useState(null);

  // Calculate the threshold for when the category selector should become sticky
  const STICKY_THRESHOLD = 900; // Adjust this value based on your layout

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const API_BASE = 'https://upvcconnect.com';
      
      // Fetch video data
      const videoResponse = await axios.get(
        `${API_BASE}/api/pricing/video`,
      );
      if (videoResponse.data && videoResponse.data.length > 0) {
        const videoData = videoResponse.data[0];
        
        // Replace production URLs with local development URLs
        if (videoData.video) {
          videoData.video = videoData.video.replace('https://upvcconnect.com', API_BASE);
        }
        if (videoData.sponsorLogo) {
          videoData.sponsorLogo = videoData.sponsorLogo.replace('https://upvcconnect.com', API_BASE);
        }
        
        console.log('📹 Video data fetched:', videoData);
        console.log('🖼️ Sponsor logo path:', videoData.sponsorLogo);
        console.log('📝 Sponsor text:', videoData.sponsorText);
        setVideoData(videoData);
      }

      // Fetch heading data
      const headingResponse = await axios.get(
        `${API_BASE}/api/pricing/heading`,
      );
      if (headingResponse.data) {
        setHeadingData(headingResponse.data);
      }

      // Fetch comparison data
      const comparisonResponse = await axios.get(
        `${API_BASE}/api/pricing/comparison`,
      );
      if (comparisonResponse.data && comparisonResponse.data.success) {
        setComparisonData(comparisonResponse.data.data);
      }

      // Fetch page content (header subtitle)
      const contentResponse = await axios.get(
        `${API_BASE}/api/pricing/content`,
      );
      if (contentResponse.data && contentResponse.data.success) {
        setPageContent(contentResponse.data.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Handle scroll events
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsSticky(offsetY > STICKY_THRESHOLD);
      },
    }
  );

  const scrollToComparison = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: STICKY_THRESHOLD + 10,
        animated: true,
      });
    }
  };

  // Handle category selection specifically for comparison
  const handleCategorySelection = (category) => {
    setSelectedCategory(category);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AppText style={styles.errorText}>
          Error loading content: {error}
        </AppText>
      </View>
    );
  }

  const renderComparisonRow = (item) => {
    let content = '';
    switch (selectedCategory) {
      case 'Premium':
        content = item.premium;
        break; 
      case 'Mid-Range':
        content = item.midRange;
        break; 
      case 'Economy':
        content = item.economy;
        break;
    }

    return (
      <View key={item._id} style={styles.comparisonRow}>
        <AppText weight="Inter" style={styles.comparisonCategory}>
          {item.category}
        </AppText>
        <AppText weight="Inter" style={styles.comparisonContent}>
          {content}
        </AppText>
      </View>
    );
  };

  // Category selector component that can be used both as sticky and regular
  const CategorySelector = ({ isSticky: stickyMode = false }) => (
    <View style={[
      styles.categorySelector,
      stickyMode && styles.stickyCategorySelectorContainer
    ]}>
      <TouchableOpacity 
        style={[
          styles.categoryButton, 
          selectedCategory === 'Economy' && styles.categoryButtonActive
        ]}
        onPress={() => handleCategorySelection('Economy')}
      >
        <AppText weight="Inter" style={[
          styles.categoryButtonText,
          selectedCategory === 'Economy' && styles.categoryButtonTextActive
        ]}>
          ECONOMY
        </AppText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.categoryButton, 
          selectedCategory === 'Mid-Range' && styles.categoryButtonActive
        ]}
        onPress={() => handleCategorySelection('Mid-Range')}
      >
        <AppText weight="Inter" style={[
          styles.categoryButtonText,
          selectedCategory === 'Mid-Range' && styles.categoryButtonTextActive
        ]}>
          MID-RANGE
        </AppText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.categoryButton, 
          selectedCategory === 'Premium' && styles.categoryButtonActive
        ]}
        onPress={() => handleCategorySelection('Premium')}
      >
        <AppText weight="Inter" style={[
          styles.categoryButtonText,
          selectedCategory === 'Premium' && styles.categoryButtonTextActive
        ]}>
          PREMIUM
        </AppText>
      </TouchableOpacity>
    </View>
  );
  // Sticky category selector component
  const StickyCategorySelector = () => (
    <Animated.View style={[
      styles.stickyCategorySelector, 
      isSticky && styles.stickyActive
    ]}>
      <CategorySelector isSticky={true} />
    </Animated.View>
  );
return (
    <View style={{ paddingTop: insets.top, flex: 1, backgroundColor: 'white' }}>
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
          </View>

          <View style={styles.menuContainer}>
            <HamburgerMenu />
          </View>
        </View>
        <TopTabBar />
        
        {/* Sticky Category Selector */}
        <StickyCategorySelector />
        
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#000000']}
              tintColor={'#000000'}
            />
          }
        >
          <View style={styles.header}>
            <AppText weight="Inter" style={styles.headerTitle}>
              {videoData?.title || 'PRICE - KNOW IT ALL'}
            </AppText>
            {/* <AppText weight="Inter" style={styles.headerSubtitle}>
              {videoData?.subtitle ||
                'The cost is the entry fee, the value is the experience!'}
            </AppText> */}
            <View style={styles.videoContainer}>
              {videoData?.video && !videoError ? (
                <>
                  <Video
                    source={{
                      uri: videoData.video,
                    }}
                    style={styles.video}
                    resizeMode="contain"
                    muted={isMuted}
                    volume={isMuted ? 0.0 : 1.0}
                    paused={isPaused}
                    controls={true}
                    repeat={true}
                    playWhenInactive={false}
                    playInBackground={false}
                    ignoreSilentSwitch="ignore"
                    onError={(error) => {
                      console.log('❌ Video Error:', error);
                      console.log('Video URL:', videoData.video);
                      setVideoError(error);
                    }}
                    onLoad={(data) => {
                      console.log('✅ Video loaded successfully:', data);
                      console.log('Video URL:', videoData.video);
                      setVideoError(null);
                    }}
                    onLoadStart={() => {
                      console.log('Video load started');
                      console.log('Video URL:', videoData.video);
                      setVideoError(null);
                    }}
                    onBuffer={(data) => {
                      console.log('Video buffering:', data);
                    }}
                    poster={videoData.thumbnail ? videoData.thumbnail : undefined}
                    onPress={() => setIsPaused(!isPaused)}
                    selectedVideoTrack={{
                      type: "resolution",
                      value: 720
                    }}
                  />
                  
                  {/* Mute Button positioned in top-right */}
                  <View style={styles.muteControlsContainer}>
                    <TouchableOpacity
                      style={styles.muteControlButton}
                      onPress={() => setIsMuted(!isMuted)}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={isMuted ? "volume-off" : "volume-up"}
                        size={28}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  </View>
                </>
              ) : videoError ? (
                <View style={styles.videoErrorContainer}>
                  <Icon name="error-outline" size={48} color="#ff6b6b" />
                  <AppText style={styles.videoErrorTitle}>Video Unavailable</AppText>
                  <AppText style={styles.videoErrorText}>
                    This video format is not supported on your device. Please contact support for assistance.
                  </AppText>
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => {
                      setVideoError(null);
                      setIsPaused(true);
                    }}
                  >
                    <AppText style={styles.retryButtonText}>Try Again</AppText>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.noVideoContainer}>
                  <Icon name="videocam-off" size={48} color="#666" />
                  <AppText style={styles.noVideoText}>No video available</AppText>
                </View>
              )}
            </View>
            {(videoData?.sponsorLogo || videoData?.sponsorText) && (
              <View style={styles.sponsorContainer}>
                <LinearGradient
                  colors={['white', 'white']}
                  style={styles.sponsorGradient}>

                  <View style={styles.sponsorContent}>
                    {videoData?.sponsorLogo && (
                      <Image
                        source={{
                          uri: videoData.sponsorLogo,
                        }}
                        style={styles.sponsorLogo}
                        resizeMode="contain"
                        onError={() => {
                          console.error('❌ Sponsor logo failed to load:', videoData.sponsorLogo);
                        }}
                        onLoad={() => {
                          console.log('✅ Sponsor logo loaded:', videoData.sponsorLogo);
                        }}
                      />
                    )}
                    {videoData?.sponsorText && (
                      <AppText weight="Inter" style={styles.sponsorText}>
                        {videoData.sponsorText}
                      </AppText>
                    )}
                  </View>
                </LinearGradient>
              </View>
            )}
          </View>
          <View style={styles.headerSubtitleContainer}>
            <AppText weight="Inter" style={styles.headerSubtitle2}>
              {pageContent?.headerSubtitle
              }
            </AppText>
          </View>

          

          {/* Premium Comparison Section */}
          <View style={styles.comparisonContainer}>
            <AppText weight="Inter" style={styles.comparisonTitle}>
              COMPARISON OF UPVC WINDOWS
            </AppText>
            
            {/* Category Selector (Regular - always visible) */}
            <CategorySelector />

            {/* Comparison Content */}
            <View style={styles.comparisonContentContainer}>
              {comparisonData.length > 0 ? (
                comparisonData.map(item => renderComparisonRow(item))
              ) : (
                <AppText style={styles.noDataText}>No comparison data available</AppText>
              )}
            </View>
 
          </View>

          <View style={styles.buyNowContainer}>
            <TouchableOpacity
              style={styles.buyNowButton}
              onPress={() => navigation.navigate('BuyNowScreen')}>
              <AppText weight="Inter" style={styles.buyNowText}>
                BUY NOW
              </AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: width * 0.06,
    color: '#000000',
    letterSpacing: 2,
    marginBottom: 5,
  },
  headerSubtitle: {
    textAlign: 'center',
    color: 'black',
    marginTop: 5,
    fontSize: 14,
    opacity: 0.8,
  },
  headerSubtitle2: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 22,
  },
  headerSubtitleContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#999999',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 15,
    marginBottom: 10,
    backgroundColor: '#000000',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  noVideoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  noVideoText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  videoErrorContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    padding: 20,
  },
  videoErrorTitle: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b6b',
    textAlign: 'center',
  },
  videoErrorText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  muteControlsContainer: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 25,
    padding: 8,
  },
  muteControlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  Headercontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: '100%',
  },
  backButton: {
    padding: 5,
    width: 40,
    alignItems: 'flex-start',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 50,
  },
  menuContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
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
  buyNowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  buyNowButton: {
    width: '70%',
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buyNowText: {
    color: '#FFFFFF',
    fontSize: 16,
    letterSpacing: 1,
  },
  
  // Comparison Section Styles
  comparisonContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 5,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#000',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  comparisonContentContainer: {
    marginBottom: 20,
  },
  comparisonRow: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  comparisonCategory: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  comparisonContent: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  
  // Pricing Box Styles
  pricingBox: {
    marginHorizontal: 15,
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#999999',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pricingText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  pricingLabel: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // Sticky Category Selector Styles
  stickyCategorySelector: {
    position: 'absolute',
    top: 120, // Adjust based on your header height
    left: 0,
    right: 0,
    zIndex: 1000,
    opacity: 0,
    paddingHorizontal: 15,
  },
  stickyActive: {
    opacity: 1,
  },
  stickyCategorySelectorContainer: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
});
export default Price;