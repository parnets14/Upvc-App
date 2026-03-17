import {useRef, useState, useEffect} from 'react';
import {
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import Video from 'react-native-video';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {styles} from './styles';
import AppText from '../../../../components/AppText';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {cleanVideoUrl} from '../../../../utils/urlHelper';

const {width} = Dimensions.get('window');

const WindowPrices = ({ shouldPlayVideo = false }) => {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [homepageData, setHomepageData] = useState(null);
  const [activeMoment, setActiveMoment] = useState(null);
  const navigation = useNavigation();
  const [paused, setPaused] = useState(true); // Always start paused
  const [isMuted, setIsMuted] = useState(false);

  // Update paused state when shouldPlayVideo prop changes
  // Also increment videoKey to force remount the Video — this is the only reliable
  // way to stop native controls from overriding the paused prop
  const [videoKey, setVideoKey] = useState(0);

  useEffect(() => {
    if (!shouldPlayVideo) {
      setPaused(true);
      setVideoKey(k => k + 1); // remount video to force-stop native player
    } else {
      setPaused(false);
    }
  }, [shouldPlayVideo]);

  // Listen to both tab navigator (blur on tab switch) and parent stack navigator
  // (blur when a stack screen like Notification is pushed on top of BuyerMain)
  useEffect(() => {
    const stopVideo = () => {
      setPaused(true);
      setVideoKey(k => k + 1); // force remount to override native controls
    };

    // Tab-level blur (switching tabs)
    const unsubscribeTabBlur = navigation.addListener('blur', stopVideo);
    const unsubscribeTabFocus = navigation.addListener('focus', () => {
      if (shouldPlayVideo) setPaused(false);
    });

    // Stack-level blur (Notification, PricesScreen, etc. pushed on top)
    const parentNav = navigation.getParent();
    let unsubscribeStackBlur = () => {};
    let unsubscribeStackFocus = () => {};
    if (parentNav) {
      unsubscribeStackBlur = parentNav.addListener('blur', stopVideo);
      unsubscribeStackFocus = parentNav.addListener('focus', () => {
        if (shouldPlayVideo) setPaused(false);
      });
    }

    return () => {
      unsubscribeTabBlur();
      unsubscribeTabFocus();
      unsubscribeStackBlur();
      unsubscribeStackFocus();
    };
  }, [navigation, shouldPlayVideo]);

  const fetchHomepageData = async () => {
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await axios.get(`https://upvcconnect.com/api/homepage?t=${timestamp}`);
      console.log('📡 Homepage API Response:', response.data);
      setHomepageData(response.data.data);
      // Reset video error state when new data is loaded
      setVideoError(false);
    } catch (error) {
      console.error('Error fetching homepage data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    console.log('🔄 Refreshing homepage data...');
    setRefreshing(true);
    fetchHomepageData();
  };

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const handleMomentPress = timestamp => {
    if (videoRef.current) { 
      const [minutes, seconds] = timestamp.split('.').map(Number);
      const seekTime = minutes * 60 + seconds;
      videoRef.current.seek(seekTime);
      setActiveMoment(timestamp);
    }
  };

  const formatTimestamp = timestamp => {
    const [minutes, seconds] = timestamp.split('.');
    return `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  };

  const isMomentActive = timestamp => {
    return activeMoment === timestamp;
  };

  if (loading) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  if (!homepageData) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <MaterialIcons name="error-outline" size={50} color="#000000" />
        <AppText weight="Inter" style={{marginTop: 10}}>Failed to load data</AppText>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{paddingBottom: 80}}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#000000']}
          tintColor={'#000000'}
        />
      }
    >
      <View style={styles.descriptionContainer}>
        <AppText weight="Inter" style={styles.descriptionTitle}>
          {homepageData.title}
        </AppText>
        <AppText weight="Inter" style={styles.descriptionText}>
          {homepageData.subtitle}
        </AppText>
      </View>

      {homepageData?.sponsorLogo && (
        <View style={styles.sponsorContainer}>
          <View style={styles.sponsorContent}> 
            <Image
              source={{uri: cleanVideoUrl(`https://upvcconnect.com/${homepageData.sponsorLogo}`)}}
              style={styles.sponsorLogo}
              resizeMode="contain"
            />
            {homepageData.sponsorText && (
              <AppText weight="Inter" style={styles.sponsorText}>
                 {homepageData.sponsorText.toUpperCase()}
              </AppText>
            )}
          </View>
        </View>
      )}

      {/* Video Player */}
      <View style={styles.videoContainer}>
        {!videoError ? (
          <>
            <Video
              key={videoKey}
              ref={videoRef}
              source={{uri: cleanVideoUrl(`https://upvcconnect.com/${homepageData.videoUrl}`)}}
              style={styles.videoPlayer}
              paused={paused}
              resizeMode="contain"
              controls={true}
              muted={isMuted}
              volume={isMuted ? 0.0 : 1.0}
              playInBackground={false}
              playWhenInactive={false}
              onError={(error) => {
                console.error('❌ Video Error:', error);
                console.error('🎥 Video URL:', cleanVideoUrl(`https://upvcconnect.com/${homepageData.videoUrl}`));
                setVideoError(true);
              }}
              onLoad={(data) => {
                console.log('✅ Video Loaded Successfully:', data);
                console.log('🎥 Video URL:', cleanVideoUrl(`https://upvcconnect.com/${homepageData.videoUrl}`));
                setVideoError(false);
              }}
              onLoadStart={() => {
                console.log('🔄 Video Load Started');
                console.log('🎥 Video URL:', cleanVideoUrl(`https://upvcconnect.com/${homepageData.videoUrl}`));
              }}
            />
            
            {/* Mute Button positioned with video controls */}
            <View style={styles.muteControlsContainer}>
              <TouchableOpacity
                style={styles.muteControlButton}
                onPress={() => setIsMuted(!isMuted)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={isMuted ? "volume-off" : "volume-up"}
                  size={28}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.videoFallback}>
            <MaterialIcons name="error-outline" size={50} color="#FFFFFF" />
            <AppText weight="Regular" style={styles.fallbackText}>
              Video unavailable
            </AppText>
            <TouchableOpacity 
              style={{marginTop: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 5}}
              onPress={() => {
                console.log('🔄 Retrying video load...');
                setVideoError(false);
              }}
            >
              <AppText weight="Regular" style={{color: '#FFFFFF', fontSize: 12}}>
                Tap to Retry
              </AppText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Key Moments Carousel */}
      {homepageData?.keyMoments && homepageData?.keyMoments?.length > 0 && (
        <View style={styles.carouselContainer}>
          <AppText weight="Inter" style={styles.carouselTitle}>
            KEY VIDEO MOMENTS
          </AppText>
          <FlatList
            horizontal
            data={homepageData.keyMoments}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.carouselItem,
                  isMomentActive(item.timestamp) && styles.activeCarouselItem,
                ]}
                onPress={() => handleMomentPress(item.timestamp)}>
                <View style={styles.carouselContent}>
                  <Image
                    source={{uri: cleanVideoUrl(`https://upvcconnect.com/${item.thumbnail}`)}}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                  <View style={styles.carouselTextContainer}>
                    <AppText
                      weight="Inter"
                      style={[
                        styles.carouselText,
                        isMomentActive(item.timestamp) && styles.activeCarouselText,
                      ]}>
                      {item.title}
                    </AppText>
                    <AppText
                      weight="Inter"
                      style={[
                        styles.carouselTimestamp,
                        isMomentActive(item.timestamp) && styles.activeCarouselTimestamp,
                      ]}>
                      {formatTimestamp(item.timestamp)}
                    </AppText>
                  </View>
                  <View style={styles.playIconContainer}>
                    <MaterialIcons
                      name={isMomentActive(item.timestamp) ? 'play-circle' : 'play-circle-outline'}
                      size={24}
                      color={isMomentActive(item.timestamp) ? '#000000' : '#000000'}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item._id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselListContent}
            snapToInterval={width * 0.75 + 15}
            snapToAlignment="start"
            decelerationRate="fast"
          />
        </View>
      )}

      <View style={styles.buyNowContainer}>
        <TouchableOpacity
          style={styles.buyNowButton}
          onPress={() => {
            if (videoRef.current) {
              videoRef.current.pause?.();
            }
            navigation.navigate('BuyNowScreen');
          }}>
          <AppText weight="Inter" style={styles.buyNowText}>
            BUY NOW
          </AppText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default WindowPrices;