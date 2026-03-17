import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking, Modal, Platform, Image, Dimensions, Animated, Easing } from 'react-native';
import { styles } from './styles';
import PrimaryButton from '../../../../components/UI/PrimaryButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
// import dummyVideo from '../../../../assets/dummy.mp4';

const { width, height } = Dimensions.get('window');

const ContactSellers = ({ navigation }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoVisible, setVideoVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Mock data
  const sellers = [
    {
      id: '1',
      name: 'UPVC Window Experts',
      phone: '+919876543210', 
      videoLink: "dummyVideo",
      specialty: 'Tinted glass specialist',
      rating: 4.8,
      projects: 124,
      responseTime: '2 hours',
      thumbnail: 'https://doorhelper.ca/wp-content/uploads/2020/06/wood-door-repair.jpg'
    },
    {
      id: '2',
      name: 'UPVC Doors Experts',
      phone: '+919876543211', 
      videoLink: "dummyVideo",
      specialty: 'Tinted Door specialist',
      rating: 4.0,
      projects: 12,
      responseTime: '2 hours',
      thumbnail: 'https://doorhelper.ca/wp-content/uploads/2020/06/wood-door-repair.jpg'
    },
    {
      id: '3',
      name: 'UPVC Doors Experts',
      phone: '+919876543211', 
      videoLink: "dummyVideo",
      specialty: 'Tinted Door specialist',
      rating: 4.0,
      projects: 12,
      responseTime: '2 hours',
      thumbnail: 'https://doorhelper.ca/wp-content/uploads/2020/06/wood-door-repair.jpg'
    },
  ];

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true
      })
    ]).start();
  };

  const handleCall = (phone) => {
    animateButton();
    Linking.openURL(`tel:${phone}`);
  };

  const handleMessage = (phone) => {
    animateButton();
    const url = Platform.OS === 'ios' 
      ? `whatsapp://send?phone=${phone}`
      : `https://wa.me/${phone}`;
    Linking.openURL(url);
  };

  const openVideo = (videoUrl) => {
    setSelectedVideo(videoUrl);
    setVideoVisible(true);
    setPaused(false);
    setShowControls(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleProgress = (data) => {
    setProgress(data.currentTime / duration);
  };

  const handleLoad = (data) => {
    setDuration(data.duration);
  };

  const handleSeek = (value) => {
    videoRef.current.seek(value * duration);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const renderSellerItem = ({ item }) => (
    <View style={styles.sellerCard}>
      <View style={styles.sellerHeader}>
        <Image 
          source={{ uri: item.thumbnail }} 
          style={styles.sellerAvatar}
        />
        <View style={styles.sellerInfo}>
          <Text style={styles.sellerName}>{item.name}</Text>
          <Text style={styles.sellerSpecialty}>{item.specialty}</Text> 
        </View>
      </View>

      <TouchableOpacity 
        onPress={() => openVideo(item.videoLink)} 
        style={styles.videoButton}
        activeOpacity={0.9}
      >
        <View style={styles.videoThumbnailContainer}>
          <Image 
            source={{ uri: item.thumbnail }} 
            style={styles.videoThumbnail}
            resizeMode="cover"
          />
          <View style={styles.playButton}>
            <Icon name="play-circle-filled" size={48} color="rgba(255,255,255,0.9)" />
          </View>
          <View style={styles.videoOverlay}>
            <Text style={styles.watchText}>WATCH PROFILE</Text>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.ratingContainer}>
          <View style={{display:"flex" , flexDirection:"row"}}>
            <Icon name="star" size={16} color="#FFC107" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
              <Text >{item.projects}  projects</Text>
          </View>

      <View style={styles.contactButtons}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity 
            style={styles.callButton} 
            onPress={() => handleCall(item.phone)}
            activeOpacity={0.7}
          >
            <Icon name="call" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Call Now</Text>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity 
            style={styles.messageButton} 
            onPress={() => handleMessage(item.phone)}
            activeOpacity={0.7}
          >
            <Icon name="chat" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>WhatsApp</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
                <View style={styles.topBar}>
                  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#333" />
                  </TouchableOpacity>
                  {/* <Text style={styles.header}>Meet Your Sellers</Text> */}
                  <Text style={styles.header}>Your Quotes Are Here!</Text>
                </View>
        <Text style={styles.subHeader}>Connect with verified professionals</Text>
      </View>
      
      <FlatList
        data={sellers}
        renderItem={renderSellerItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Video Player Modal */}
      <Modal visible={videoVisible} transparent={false} animationType="slide">
        <View style={styles.videoModalContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setVideoVisible(false)}
            activeOpacity={0.7}
          >
            <Icon name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.videoTouchable}
            activeOpacity={1}
            onPress={toggleControls}
          >
            <Video
              ref={videoRef}
              source={selectedVideo}
              style={styles.videoPlayer}
              paused={paused}
              resizeMode="contain"
              onProgress={handleProgress}
              onLoad={handleLoad}
              onEnd={() => {
                setPaused(true);
                setShowControls(true);
              }}
              onError={(error) => console.log('Video error:', error)}
              ignoreSilentSwitch="obey"
              bufferConfig={{
                minBufferMs: 15000,
                maxBufferMs: 30000,
                bufferForPlaybackMs: 2500,
                bufferForPlaybackAfterRebufferMs: 5000
              }}
            />
          </TouchableOpacity>
          
          {/* Custom Controls */}
          {showControls && (
            <View style={styles.controlsContainer}>
              <TouchableOpacity onPress={() => setPaused(!paused)}>
                <Icon 
                  name={paused ? "play-arrow" : "pause"} 
                  size={32} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
              
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
              </View>
              
              <Text style={styles.timeText}>
                {formatTime(progress * duration)} / {formatTime(duration)}
              </Text>
              
              <TouchableOpacity onPress={() => handleSeek(Math.min(progress + 0.1, 1))}>
                <Icon name="forward-10" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* <PrimaryButton
        title="Back to Dashboard"
        onPress={() => navigation.navigate('HomeDashboard')}
        style={styles.ctaButton}
        icon="arrow-back"
      /> */}
      <PrimaryButton
          title="Submit New Request"
          onPress={() => navigation.navigate('BuyerOnboarding')}
          style={styles.newButton}
          icon="add"
        />
    </View>
  );
};

export default ContactSellers;