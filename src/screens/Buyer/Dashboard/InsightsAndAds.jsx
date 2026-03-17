import React, {useEffect, useState, useRef} from 'react';
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
import TopTabBar from './TopTabBar';
import AppText from '../../../components/AppText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import PremiumLoginModal from '../../../components/PremiumLoginModal';
import {cleanVideoUrl, cleanImageUrl} from '../../../utils/urlHelper';
import {useIsFocused} from '@react-navigation/native';

const {width, height} = Dimensions.get('window');

const MarketInsights = ({navigation , route}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentVideoIndices, setCurrentVideoIndices] = useState({});
  const [videoMuteStates, setVideoMuteStates] = useState({});
  const [pausedVideos, setPausedVideos] = useState({});
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Pause all videos when tab loses focus (same fix as HomeDashboard)
  const isFocused = useIsFocused();
  useEffect(() => {
    if (!isFocused) {
      setPausedVideos({});
    }
  }, [isFocused]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const categoryresponse = await axios.get(
        'https://upvcconnect.com/api/categories',
      );
      setCategories(categoryresponse?.data);
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching categories:', err);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const onViewableItemsChanged = useRef(({viewableItems, changed}) => {
    // When items leave the viewport, mark their videos as paused
    changed.forEach(item => {
      if (item.item.type === 'category' && !item.isViewable) {
        const categoryId = item.item.data._id;
        setPausedVideos(prev => ({
          ...prev,
          [categoryId]: true
        }));
      }
    });
  }).current;

  // Define sections for the FlatList
  const sections = [
    {type: 'header', data: {}},
    ...categories.map(category => ({
      type: 'category',
      data: category,
    })),
  ];

  const handleCategorySelect = async category => {
    const token = await AsyncStorage.getItem('buyerToken');

    if (!token) {
      setShowLoginModal(true);
      // Alert.alert('Login Required', 'Please login to Select a Category');
      // setShowQuoteForm(false);
      return;
    }
     if (token) {
          // setBuyerId(token);
          // Only fetch quotes if logged in
          const responseQuotes = await axios.get(
            'https://upvcconnect.com/api/quotes/buyer',
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
          );
          // console.log("responseQuotes data : " , responseQuotes?.data)
          // setQuoteCount(responseQuotes?.data?.count);
          const hasPendingQuotes = responseQuotes?.data?.quotes?.some(
  (q) => q.isGenerated === false
);

if (hasPendingQuotes) {
  navigation.navigate('QuoteRequestPage', {
    selectedCategory: category,
    formData: route.params?.formData // Pass back the original form data
  });
} else {
  navigation.navigate('BuyNowScreen', {
    selectedCategory: category,
    formData: route.params?.formData // Pass back the original form data
  });
}
        }
  };

  const renderSection = ({item}) => {
    if (item.type === 'header') {
      return (
        <View style={styles.header}>
          <AppText weight="Inter" style={styles.headerText}>
            SELECT YOUR PREFERRED CATEGORY
          </AppText>
          <AppText weight="Inter" style={styles.subHeaderText}>
            We've categorized uPVC windows into 3 tiers to match your style &
            requirements. Please select one category to explore the premium
            brands we offer.
          </AppText>
        </View>
      );
    } else if (item.type === 'category') {
      const category = item.data;
      
      // Determine which videos to display - handle both new and old format
      let videosToDisplay = [];
      
      if (category.videos && Array.isArray(category.videos) && category.videos.length > 0) {
        // New format: videos array exists and has items
        videosToDisplay = category.videos;
      } else if (category.videoUrl) {
        // Old format: single videoUrl field (backward compatibility)
        videosToDisplay = [{
          videoUrl: category.videoUrl,
          sponsorLogo: category.sponsorLogo || null,
          sponsorText: category.sponsorText || null,
          order: 0
        }];
      }
      
      const hasMultipleVideos = videosToDisplay.length > 1;
      const currentIndex = currentVideoIndices[category._id] || 0;
      const currentVideo = videosToDisplay[currentIndex] || {};
      
      const handleVideoScroll = (event) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / (width - 30));
        setCurrentVideoIndices(prev => ({
          ...prev,
          [category._id]: index
        }));
      };
      
      return (
        <View style={styles.categoryCard}>
          <LinearGradient
            colors={['#ffffff', '#ffffff']}
          
            style={styles.cardGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}>
            <View style={styles.cardHeader}>
              <View style={styles.titleContainer}>
                <AppText weight="Inter" style={styles.categoryTitle}>
                  {category.name}
                </AppText>
              </View>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => handleCategorySelect(category)}>
                <AppText weight="Inter" style={styles.selectButtonText}>
                  SELECT
                </AppText>
                <Icon
                  name="arrow-forward"
                  size={18}
                  color="#fff"
                  style={styles.selectIcon}
                />
              </TouchableOpacity>
            </View>
            <AppText weight="Inter" style={styles.categoryDescription}>
              {category.description || 'No description available'}
            </AppText>
            
            {videosToDisplay.length > 0 && (
              <View>
                <FlatList
                  data={videosToDisplay}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={handleVideoScroll}
                  keyExtractor={(videoItem, index) => `${category._id}-video-${index}`}
                  renderItem={({item: videoItem, index}) => {
                    const videoKey = `${category._id}-${index}`;
                    const isMuted = videoMuteStates[videoKey] || false;
                    
                    const toggleMute = () => {
                      setVideoMuteStates(prev => ({
                        ...prev,
                        [videoKey]: !prev[videoKey]
                      }));
                    };
                    
                    return (
                      <View style={[styles.videoContainer, {width: width - 30}]}>
                        <Video
                          source={{
                            uri: cleanVideoUrl(`https://upvcconnect.com/${videoItem.videoUrl}`),
                          }}
                          style={styles.video}
                          resizeMode="contain"
                          controls={true}
                          muted={isMuted}
                          paused={!isFocused || pausedVideos[category._id] !== false}
                          volume={isMuted ? 0.0 : 1.0}
                          audioOnly={false}
                          ignoreSilentSwitch="ignore"
                          playWhenInactive={false}
                          playInBackground={false}
                          disableFocus={false}
                          hideShutterView={true}
                          shutterColor="transparent"
                          onPlaybackStateChanged={(state) => {
                            // Track when user manually plays the video
                            if (state.isPlaying) {
                              setPausedVideos(prev => ({
                                ...prev,
                                [category._id]: false
                              }));
                            }
                          }}
                        />
                        
                        {/* Custom Mute Button */}
                        <View style={styles.muteButtonContainer}>
                          <TouchableOpacity
                            style={[
                              styles.muteButton,
                              isMuted && styles.muteButtonMuted
                            ]}
                            onPress={toggleMute}
                            activeOpacity={0.7}
                          >
                            <Icon
                              name={isMuted ? "volume-off" : "volume-up"}
                              size={26}
                              color="#fff"
                            />
                          </TouchableOpacity>
                          {isMuted && (
                            <View style={styles.mutedIndicator}>
                              <AppText style={styles.mutedText}>MUTED</AppText>
                            </View>
                          )}
                        </View>
                        
                        <LinearGradient
                          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0)']}
                          style={styles.videoOverlay}
                          start={{x: 0.5, y: 1}}
                          end={{x: 0.5, y: 0}}
                        />
                      </View>
                    );
                  }}
                />
                
                {hasMultipleVideos && (
                  <View style={styles.paginationContainer}>
                    {videosToDisplay.map((_, index) => (
                      <View
                        key={`dot-${category._id}-${index}`}
                        style={[
                          styles.paginationDot,
                          index === currentIndex && styles.paginationDotActive
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}
            
            {(currentVideo.sponsorLogo || currentVideo.sponsorText) && (
              <View style={styles.sponsorContainer}>
                <LinearGradient colors={['white', 'white']} style={styles.sponsorGradient}>
                  <View style={styles.sponsorContent}>
                    {currentVideo.sponsorLogo && (
                      <Image
                        source={{ uri: cleanImageUrl(currentVideo.sponsorLogo) }}
                        style={styles.sponsorLogo}
                        resizeMode="contain"
                        onError={(e) => {
                          console.error('❌ Sponsor logo failed to load:', {
                            originalPath: currentVideo.sponsorLogo,
                            cleanedUrl: cleanImageUrl(currentVideo.sponsorLogo),
                            categoryName: category.name
                          });
                        }}
                        onLoad={() => {
                          console.log('✅ Sponsor logo loaded successfully:', {
                            url: cleanImageUrl(currentVideo.sponsorLogo),
                            categoryName: category.name
                          });
                        }}
                      />
                    )}
                     
                    {currentVideo.sponsorText && (
                      <AppText weight="Inter" style={styles.sponsorText}>
                       {currentVideo.sponsorText.toUpperCase()}
                      </AppText>
                    )}
                  </View>
                </LinearGradient>
              </View>
            )}
          </LinearGradient>
        </View>
      );
    }
    return null;
  };

  const insets = useSafeAreaInsets();

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
          Error loading window options: {error}
        </AppText>
      </View>
    );
  }

  return (
    <View style={{paddingTop: insets.top, flex: 1, backgroundColor: 'white'}}>
      <View style={styles.mainContainer}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
        />
        <TopTabBar />
        <FlatList
          data={sections}
          renderItem={renderSection}
          keyExtractor={(item, index) => item.type + index}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
          style={styles.flatList}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
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
      <PremiumLoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        navigation={navigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    // padding: 20,
  },
  logo: {
    // marginTop: 15,
    alignSelf: 'center',
    width: 100,
    height: 50,
    // resizeMode: 'contain',
  },
  flatList: {
    backgroundColor: 'transparent',
  },
  header: {
    // marginBottom: 0,
    padding: 25,
    // paddingHorizontal:30,
    flexDirection: 'column',
    // backgroundColor: '#fff',
    // borderRadius: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: "#990",
    ...Platform.select({
      ios: {
        // shadowColor: '#000',
        // shadowOffset: {width: 0, height: 6},
        // shadowOpacity: 0.1,
        // shadowRadius: 12,
      },
      android: {
        // elevation: 8,
      },
    }),
  },
  headerText: {
    fontSize: 18,
    // fontWeight: '800',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  subHeaderText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  categoryCard: {
    // width:395,
    // bordeRadius: 20,
    // marginBottom: 25,
    // overflow: 'hidden',
    ...Platform.select({
      // ios: {
      //   shadowColor: '#000',
      //   shadowOffset: {width: 0, height: 6},
      //   shadowOpacity: 0.1,
      //   shadowRadius: 12,
      // },
      // android: {
      //   elevation: 8,
      // },
    }),
  },
  cardGradient: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  titleContainer: {
    flex: 1,
    marginRight: 15,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
  premiumNoteText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5,
  },
  categoryDescription: {
    fontSize: 13,
    color: '#555',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 5,
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
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 15,
  },
  selectButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 14,
    // fontWeight: '700',
    letterSpacing: 0.5,
  },
  selectIcon: {
    marginLeft: 5,
  },
  carouselContainer: {
    marginTop: 10,
    width: width - 40,
  },
  brandContainer: {
    width: width - 40,
    paddingRight: 10,
  },
  brandTitle: {
    fontSize: 18,
    color: '#000',
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: 1,
  },
  videoContainer: {
    width: '100%',
    borderRadius: 12,
    // marginBottom: 20,
    backgroundColor: '#000',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
    aspectRatio: 16 / 9,
    borderRadius: 10,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '30%',
  },
  muteButtonContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    alignItems: 'center',
  },
  muteButton: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 25,
    padding: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  muteButtonMuted: {
    backgroundColor: 'rgba(255,0,0,0.8)',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  mutedIndicator: {
    backgroundColor: 'rgba(255,0,0,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  mutedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#000',
    width: 24,
    borderRadius: 4,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  featureColumn: {
    width: '48%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    // fontWeight: '600',
    color: '#000',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureIcon: {
    marginTop: 2,
  },
  featureText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
    paddingRight: 50,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#000',
    width: 12,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    // paddingHorizontal: 10,
    paddingRight: 50,
  },
  navButton: {
    padding: 12,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  disabledNavButton: {
    opacity: 0.5,
  },
  counterText: {
    fontSize: 14, 
    color: '#000',
  },
  headerTitle: {
    fontSize: 18, 
    color: 'black',
    letterSpacing: 1,
  },
  tabScrollContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    height: 30,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: 'black',
  },
  tabText: {
    fontSize: 12, 
    color: '#888',
    letterSpacing: 1,
  },
  activeTabText: {
    color: 'black',
  },
});

export default MarketInsights;
