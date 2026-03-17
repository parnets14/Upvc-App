import React, { useState, useRef, Animated } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Dimensions, Modal, Linking, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PrimaryButton from '../../../../components/UI/PrimaryButton';
import Video from 'react-native-video';
// import dummyVideo from '../../../../assets/dummy.mp4';

const { width, height } = Dimensions.get('window');

const SellerQuotes = ({ navigation }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoVisible, setVideoVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef(null);

  // Mock data with responded flag
  const sellers = [
    {
      id: '1',
      name: 'UPVC Window Experts',
      phone: '+919876543210',
      videoLink: "dummyVideo",
      specialty: 'Tinted glass specialist',
      rating: 4.8,
      projects: 124,
      responded: true,
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
      responded: true,
      responseTime: '3 hours',
      thumbnail: 'https://doorhelper.ca/wp-content/uploads/2020/06/wood-door-repair.jpg'
    },
  ];

  const totalResponded = sellers.filter(s => s.responded).length;
  
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
    videoRef.current?.seek(value * duration);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const renderSellerItem = ({ item }) => (
    <View style={styles.sellerCard}>
      <View style={styles.sellerHeader}>
        <Image 
          source={{ uri: 'https://thumbs.dreamstime.com/b/profile-picture-caucasian-male-employee-posing-office-happy-young-worker-look-camera-workplace-headshot-portrait-smiling-190186649.jpg' }}
          style={styles.sellerAvatar}
        />
        <View style={styles.sellerInfo}>
          <Text style={styles.sellerName}>{item.name}</Text>
          <Text style={styles.sellerSpecialty}>{item.specialty}</Text>
          {/* <View style={styles.sellerStats}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFC107" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <Text style={styles.projectsText}>{item.projects}+ projects</Text>
            <Text style={styles.responseText}>{item.responseTime} avg response</Text>
          </View> */}
        </View>
      </View>

      <TouchableOpacity 
        style={styles.videoContainer}
        onPress={() => openVideo(item.videoLink)}
      >
        <Image 
          source={{ uri: item.thumbnail }} 
          style={styles.videoThumbnail}
        />
        <View style={styles.playButton}>
          <Icon name="play-circle-filled" size={48} color="rgba(255,255,255,0.9)" />
        </View>
        <View style={styles.videoOverlay}>
          <Text style={styles.watchText}>WATCH PROFILE VIDEO</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.sellerStats}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFC107" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <Text style={styles.projectsText}>{item.projects} projects</Text>
            <Text style={styles.responseText}>{item.responseTime} avg response</Text>
          </View>

      {/* <View style={styles.contactButtons}>
        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => handleCall(item.phone)}
        >
          <Icon name="call" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.messageButton}
          onPress={() => handleMessage(item.phone)}
        >
          <Icon name="chat" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>WhatsApp</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );

  return (
    <View style={styles.container}>
      

      <View style={styles.headerContainer}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.header}>Meet Your Sellers</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{totalResponded}/6 sellers responded</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(totalResponded/6)*100}%` }]} />
          </View>
        </View>
      </View>

      <Text style={styles.subHeader}>Top-rated professionals ready for your project</Text>
      
      <FlatList
        data={sellers.filter(s => s.responded)}
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
            />
          </TouchableOpacity>
          
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

      <View style={styles.footer}>
        <Text style={styles.unlockNote}>
          <Icon name="lock" size={16} color="#4CAF50" /> Contacts will unlock at 6 sellers or in 24 hours
        </Text>
        <PrimaryButton
          title="Contact Sellers"
          onPress={() => navigation.navigate('ContactSellers')}
          style={styles.ctaButton}
          icon="message"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop:20,
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap:20,
    // paddingTop: Platform.OS === 'ios' ? 60 : 30,
    // paddingHorizontal: 16,
    // backgroundColor: '#fff',
  },
  
  backButton: {
    padding: 8,
    // borderRadius: 24,
    // backgroundColor: '#f0f0f0',
  },  
  headerContainer: {
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 16,
    color: '#4CAF50',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  subHeader: {
    fontSize: 16,
    color: '#666666',
    marginVertical: 16,
    fontFamily: 'Inter-Regular',
  },
  listContainer: {
    paddingBottom: 24,
  },
  sellerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sellerHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    // marginTop: 16,
  },
  sellerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  sellerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  sellerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  sellerSpecialty: {
    fontSize: 14,
    color: '#4CAF50',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  sellerStats: {
    flexDirection: 'row',
    paddingTop:15,
    alignItems: 'center',
    justifyContent:'space-between',
    flexWrap: 'wrap',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
    color: '#FF9800',
    fontFamily: 'Inter-Medium',
  },
  projectsText: {
    fontSize: 14,
    marginRight: 12,
    color: '#757575',
    fontFamily: 'Inter-Regular',
  },
  responseText: {
    fontSize: 14,
    color: '#009688',
    fontFamily: 'Inter-Regular',
  },
  videoContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: 180,
  },
  playButton: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    zIndex: 2,
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    paddingVertical: 6,
    alignItems: 'center',
  },
  watchText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  videoModalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  videoTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayer: {
    width: width,
    height: height * 0.5,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  progressBarContainer: {
    width: '80%',
    height: 4,
    backgroundColor: '#666',
    borderRadius: 2,
    marginVertical: 10,
  },
  timeText: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 6,
    fontFamily: 'Inter-Regular',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  unlockNote: {
    fontSize: 14,
    color: '#4CAF50',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  ctaButton: {
    backgroundColor: '#3F51B5',
    width: '100%',
  },
});


export default SellerQuotes;