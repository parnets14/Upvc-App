// import { useState, useEffect } from 'react';
// import {
//   View,
//   StyleSheet,
//   Image,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert, 
//   RefreshControl
// } from 'react-native';
// import Video from 'react-native-video';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import AppText from '../../components/AppText';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Share } from 'react-native'

// const BASE_URL = 'https://upvcconnect.com/api/advertisments';

// const MarketInsights = () => {
//   const insets = useSafeAreaInsets();
//   const [activeTab, setActiveTab] = useState('featured');
//   const [ads, setAds] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const [videoStates, setVideoStates] = useState({}); // Track mute state for each video

//   const fetchData = async () => {
//     try {
//       const token = await AsyncStorage.getItem('sellerToken');
//       if (!token) {
//         Alert.alert('Please Login');
//         setIsLoading(false);
//         setRefreshing(false);
//         return;
//       }
      
//       let url = BASE_URL;
//       if (activeTab !== 'featured') {
//         url = `${BASE_URL}/${activeTab}`;
//       }

//       const response = await axios.get(url, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const sellerResponse = await axios.get('https://upvcconnect.com/api/sellers', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
      
//       setUserId(sellerResponse.data.seller._id);
//       setAds(response.data.ads);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to fetch advertisements');
//       console.error('Error fetching ads:', error);
//     } finally {
//       setIsLoading(false);
//       setRefreshing(false);
//     }
//   };

//    useEffect(() => {
//     fetchData();
//   }, [activeTab]);

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchData();
//   };

//   const toggleLike = async (adId) => {
//     try {
//       const token = await AsyncStorage.getItem('sellerToken');
//       const response = await axios.post(
//         `${BASE_URL}/${adId}/like`,
//         { userId },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setAds(ads.map(ad =>
//         ad._id === adId
//           ? {
//             ...ad,
//             likes: response.data.likes,
//             likedBy: response.data.isLiked
//               ? [...ad.likedBy, userId]
//               : ad.likedBy.filter(id => id !== userId)
//           }
//           : ad
//       ));
//     } catch (error) {
//       Alert.alert('Error', 'Failed to like the post');
//       console.error('Error toggling like:', error);
//     }
//   };

//   const handleShare = async (item) => {
//     try {
//       const shareOptions = {
//         message: `${item.title}\n\n${item.description}\n\nCheck this out: https://upvcconnect.com/${item.mediaUrl.replace(/\\/g, '/')}`,
//       };
//       await Share.share(shareOptions);
//     } catch (error) {
//       console.error('Error sharing ad:', error);
//       Alert.alert('Error', 'Failed to share the post');
//     }
//   };

//   // Toggle mute for specific video
//   const toggleMute = (videoId) => {
//     setVideoStates(prev => ({
//       ...prev,
//       [videoId]: {
//         ...prev[videoId],
//         isMuted: !prev[videoId]?.isMuted
//       }
//     }));
//   };

//   const renderItem = ({ item }) => {
//     return (
//       <View style={styles.postContainer}>
//         <View style={styles.postHeader}>
//           <AppText weight='Inter' style={styles.postTitle}>{item.title}</AppText>
//         </View>

//         {item.type === 'video' ? (
//           <View style={styles.videoContainer}>
//             <Video
//               source={{ uri: `https://upvcconnect.com/${item.mediaUrl.replace(/\\/g, '/')}` }}
//               style={styles.video}
//               controls={true}
//               resizeMode="contain"
//               onError={(error) => {
//                 console.log('Video Error:', error);
//               }}
//               onLoad={() => {
//                 console.log('Video loaded successfully');
//               }}
//             />
//           </View>
//         ) : (
//           <Image
//             source={{ uri: `https://upvcconnect.com/${item.mediaUrl.replace(/\\/g, '/')}` }}
//             style={styles.image}
//             resizeMode="cover"
//           />
//         )}
//         <AppText weight='Inter' style={styles.postDescription}>{item.description}</AppText>

//         <View style={styles.postFooter}>
//           <TouchableOpacity
//             style={styles.actionButton}
//             onPress={() => toggleLike(item._id)}
//           >
//             <Icon
//               name={item.likedBy?.includes(userId) ? "favorite" : "favorite-border"}
//               size={24}
//               color={item.likedBy?.includes(userId) ? "red" : "black"}
//             />
//             <AppText weight='Inter' style={styles.actionText}>{item.likes}</AppText>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.actionButton}
//             onPress={() => handleShare(item)}
//           >
//             <Icon name="share" size={22} color="black" />
//             <AppText weight='Inter' style={styles.actionText}>Share</AppText>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   if (isLoading && !refreshing) {
//     return (
//       <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
//         <ActivityIndicator size="large" color="black" />
//       </View>
//     );
//   }

//   return (
//     <View style={{ paddingTop: insets.top, flex: 1, backgroundColor: 'white' }}>
//       <View style={styles.container}>
//         <Image
//           source={require('../../assets/logo.png')}
//           style={styles.logo}
//         />

//         <View style={styles.tabs}>
//           <TouchableOpacity
//             style={[styles.tab, activeTab === 'featured' && styles.activeTab]}
//             onPress={() => setActiveTab('featured')}
//           >
//             <AppText weight='SemiBold' style={[styles.tabText, activeTab === 'featured' && styles.activeTabText]}>
//               FEATURED
//             </AppText>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.tab, activeTab === 'latest' && styles.activeTab]}
//             onPress={() => setActiveTab('latest')}
//           >
//             <AppText weight='SemiBold' style={[styles.tabText, activeTab === 'latest' && styles.activeTabText]}>
//               LATEST
//             </AppText>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.tab, activeTab === 'trending' && styles.activeTab]}
//             onPress={() => setActiveTab('trending')}
//           >
//             <AppText weight='SemiBold' style={[styles.tabText, activeTab === 'trending' && styles.activeTabText]}>
//               TRENDING
//             </AppText>
//           </TouchableOpacity>
//         </View>

//         <FlatList
//           data={ads}
//           renderItem={renderItem}
//           keyExtractor={item => item._id}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               colors={['#000000']}
//               tintColor={'#000000'}
//             />
//           }
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <AppText weight='Inter' style={styles.emptyText}>
//                 {refreshing ? 'Refreshing...' : 'No advertisements found'}
//               </AppText>
//             </View>
//           }
//         />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'white',
//     paddingBottom: 50
//   },
//   logo: {
//     alignSelf: "center",
//     width: 100,
//     height: 50,
//   },
//   tabs: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   tab: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 15,
//   },
//   activeTab: {
//     borderBottomWidth: 2,
//     borderBottomColor: 'black',
//   },
//   tabText: {
//     fontSize: 12,
//     color: '#888',
//     letterSpacing: 2,
//   },
//   activeTabText: {
//     color: 'black',
//   },
//   listContent: {
//     paddingBottom: 20,
//     flexGrow: 1,
//   },
//   postContainer: {
//     marginTop: 20,
//     paddingHorizontal: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     paddingBottom: 20,
//   },
//   postHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   postTitle: {
//     textAlign: "center",
//     fontSize: 18,
//     color: 'black',
//     flex: 1,
//   },
//   videoContainer: {
//     width: '100%',
//     height: 200,
//     backgroundColor: '#000',
//     marginBottom: 10,
//   },
//   video: {
//     width: '100%',
//     height: '100%',
//   },
//   muteButton: {
//     position: 'absolute',
//     top: 8,
//     left: 8,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     borderRadius: 16,
//     width: 32,
//     height: 32,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   image: {
//     width: '100%',
//     aspectRatio: 16 / 9,
//     borderRadius: 8,
//     backgroundColor: '#f5f5f5',
//   },
//   postDescription: {
//     fontSize: 14,
//     color: '#333',
//     marginTop: 10,
//     lineHeight: 20,
//     textAlign: "center",
//   },
//   postFooter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 15,
//     justifyContent: 'space-between',
//     paddingHorizontal: 10
//   },
//   actionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   actionText: {
//     fontSize: 14,
//     color: 'black',
//     marginLeft: 5,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 50,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#888',
//   },
// });
 
// export default MarketInsights; 
 
 import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppText from '../../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Share } from 'react-native';
import { cleanVideoUrl } from '../../utils/urlHelper';

const BASE_URL = 'https://upvcconnect.com/api/advertisements';
const MEDIA_BASE = 'https://upvcconnect.com';

const MarketInsights = () => {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState('featured');
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  // 🔑 Track which video is playing
  const [playingVideoId, setPlayingVideoId] = useState(null);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('sellerToken');
      if (!token) {
        Alert.alert('Please Login');
        setIsLoading(false);
        setRefreshing(false);
        return;
      }

      let url = BASE_URL;
      if (activeTab !== 'featured') {
        url = `${BASE_URL}/${activeTab}`;
      }

      const adsRes = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sellerRes = await axios.get(
        'https://upvcconnect.com/api/sellers',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserId(sellerRes.data.seller._id);
      setAds(adsRes.data.ads);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch advertisements');
      console.log(error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const toggleLike = async (adId) => {
    try {
      const token = await AsyncStorage.getItem('sellerToken');

      const res = await axios.post(
        `${BASE_URL}/${adId}/like`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAds(prev =>
        prev.map(ad =>
          ad._id === adId
            ? {
                ...ad,
                likes: res.data.likes,
                likedBy: res.data.isLiked
                  ? [...ad.likedBy, userId]
                  : ad.likedBy.filter(id => id !== userId),
              }
            : ad
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to like post');
    }
  };

  const handleShare = async (item) => {
    try {
      // Clean the media URL for sharing
      const cleanMediaUrl = cleanVideoUrl(`${MEDIA_BASE}/${item.mediaUrl.replace(/\\/g, '/')}`);
      
      await Share.share({
        message: `${item.title}\n\n${item.description}\n\n${cleanMediaUrl}`,
      });
    } catch {
      Alert.alert('Error', 'Failed to share');
    }
  };

  const renderItem = ({ item }) => {
    // Clean the media URL using the URL helper
    const mediaUrl = cleanVideoUrl(`${MEDIA_BASE}/${item.mediaUrl.replace(/\\/g, '/')}`);

    return (
      <View style={styles.postContainer}>
        <AppText weight="SemiBold" style={styles.postTitle}>
          {item.title}
        </AppText>

        {item.type === 'video' ? (
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: mediaUrl }}
              style={styles.video}
              controls
              paused={playingVideoId !== item._id}
              resizeMode="contain"
              poster="https://via.placeholder.com/300"
              posterResizeMode="cover"
              onTouchStart={() => setPlayingVideoId(item._id)}
              onEnd={() => setPlayingVideoId(null)}
              onError={e => {
                console.log('Video error:', e);
                console.log('Video URL:', mediaUrl);
              }}
              onLoad={() => {
                console.log('Video loaded successfully:', mediaUrl);
              }}
            />
          </View>
        ) : (
          <Image source={{ uri: mediaUrl }} style={styles.image} />
        )}

        <AppText style={styles.postDescription}>{item.description}</AppText>

        <View style={styles.postFooter}>
          <TouchableOpacity onPress={() => toggleLike(item._id)} style={styles.actionBtn}>
            <Icon
              name={item.likedBy?.includes(userId) ? 'favorite' : 'favorite-border'}
              size={24}
              color={item.likedBy?.includes(userId) ? 'red' : 'black'}
            />
            <AppText style={styles.actionText}>{item.likes}</AppText>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleShare(item)} style={styles.actionBtn}>
            <Icon name="share" size={22} color="black" />
            <AppText style={styles.actionText}>Share</AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#fff' }}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />

      <View style={styles.tabs}>
        {['featured', 'latest', 'trending'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <AppText style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.toUpperCase()}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={ads}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        removeClippedSubviews={false}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText>No advertisements found</AppText>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { alignSelf: 'center', width: 100, height: 50 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  activeTab: { borderBottomWidth: 2, borderColor: '#000' },
  tabText: { fontSize: 12, color: '#888', letterSpacing: 2 },
  activeTabText: { color: '#000' },

  postContainer: { padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  postTitle: { fontSize: 18, textAlign: 'center' },

  videoContainer: { height: 200, backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },

  image: { width: '100%', aspectRatio: 16 / 9, borderRadius: 8 },

  postDescription: { marginTop: 10, textAlign: 'center', color: '#333' },

  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center' },
  actionText: { marginLeft: 6 },

  empty: { marginTop: 40, alignItems: 'center' },
});

export default MarketInsights;


// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   StyleSheet,
//   Image,
//   FlatList,
//   TouchableOpacity,
//   Dimensions,
//   ActivityIndicator,
//   Alert
// } from 'react-native';
// import Video from 'react-native-video';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import AppText from '../../components/AppText';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Share } from 'react-native'

// const { width } = Dimensions.get('window');
// const BASE_URL = 'https://upvcconnect.com/api/advertisments';

// const MarketInsights = () => {

//   const insets = useSafeAreaInsets();

//   const [activeTab, setActiveTab] = useState('featured');
//   const [ads, setAds] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [userId, setUserId] = useState(null);
//   console.log("userId : ", userId)

//   const fetchData = async () => {
//     try {
//       const token = await AsyncStorage.getItem('sellerToken');
//       if (!token) {
//         Alert.alert('Please Login');
//         return;
//       }
//       let url = BASE_URL;
//       if (activeTab !== 'featured') {
//         url = `${BASE_URL}/${activeTab}`;
//       }

//       const response = await axios.get(url, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const sellerResponse = await axios.get('https://upvcconnect.com/api/sellers', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       // console.log("sellerResponse.data : " , )
//       setUserId(sellerResponse.data.seller._id);
//       setAds(response.data.ads);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to fetch advertisements');
//       console.error('Error fetching ads:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {

//     fetchData();
//   }, [activeTab]);
  
//   const toggleLike = async (adId) => {
//     try {
//       const token = await AsyncStorage.getItem('sellerToken');
//       const response = await axios.post(
//         `${BASE_URL}/${adId}/like`,
//         { userId },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setAds(ads.map(ad =>
//         ad._id === adId
//           ? {
//             ...ad,
//             likes: response.data.likes,
//             likedBy: response.data.isLiked
//               ? [...ad.likedBy, userId]
//               : ad.likedBy.filter(id => id !== userId)
//           }
//           : ad
//       ));
//     } catch (error) {
//       Alert.alert('Error', 'Failed to like the post');
//       console.error('Error toggling like:', error);
//     }
//   };

//   const handleShare = async (item) => {
//     try {
//       const shareOptions = {
//         message: `${item.title}\n\n${item.description}\n\nCheck this out: ${item.type === 'video' 
//           ? `https://upvcconnect.com/${item.mediaUrl}`
//           : `https://upvcconnect.com/uploads/${item.mediaUrl}`
//         }`,
//       };
//       await Share.share(shareOptions);
//     } catch (error) {
//       console.error('Error sharing ad:', error);
//       Alert.alert('Error', 'Failed to share the post');
//     }
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.postContainer}>
//       <View style={styles.postHeader}>
//         <AppText weight='Inter' style={styles.postTitle}>{item.title}</AppText>

//       </View>

//       {item.type === 'video' ? (
//         <View style={styles.videoContainer}>
//           <Video
//             source={{ uri: `https://upvcconnect.com/${item.mediaUrl}` }}
//             style={styles.video}
//             resizeMode="cover"
//             poster={item.thumbnailUrl ? `https://upvcconnect.com/${item.thumbnailUrl}` : undefined}
//             posterResizeMode="cover"
//             controls
//             paused
//           />
//         </View>
//       ) : (
//         <Image
//           source={{ uri: `https://upvcconnect.com/uploads/${item.mediaUrl}` }}
//           style={styles.image}
//           resizeMode="cover"
//         />
//       )}

//       <AppText weight='Inter' style={styles.postDescription}>{item.description}</AppText>

//       <View style={styles.postFooter}>
//         <TouchableOpacity
//           style={styles.actionButton}
//           onPress={() => toggleLike(item._id)}
//         >
//           <Icon
//             name={item.likedBy?.includes(userId) ? "favorite" : "favorite-border"}
//             size={24}
//             color={item.likedBy?.includes(userId) ? "red" : "black"}
//           />
//           <AppText weight='Inter' style={styles.actionText}>{item.likes}</AppText>
//         </TouchableOpacity>

//         {/* <TouchableOpacity style={styles.actionButton}>
//           <Icon name="share" size={22} color="black" />
//           <AppText weight='Inter' style={styles.actionText}>Share</AppText>
//         </TouchableOpacity> */}
//         <TouchableOpacity
//           style={styles.actionButton}
//           onPress={() => handleShare(item)}
//         >
//           <Icon name="share" size={22} color="black" />
//           <AppText weight='Inter' style={styles.actionText}>Share</AppText>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   if (isLoading) {
//     return (
//       <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
//         <ActivityIndicator size="large" color="black" />
//       </View>
//     );
//   }

//   return (
//     <View style={{ paddingTop: insets.top, flex: 1, backgroundColor: 'white' }}>
//       <View style={styles.container}>
//         <Image
//           source={require('../../assets/logo.png')}
//           style={styles.logo}
//         />

//         <View style={styles.tabs}>
//           <TouchableOpacity
//             style={[styles.tab, activeTab === 'featured' && styles.activeTab]}
//             onPress={() => setActiveTab('featured')}
//           >
//             <AppText weight='SemiBold' style={[styles.tabText, activeTab === 'featured' && styles.activeTabText]}>
//               FEATURED
//             </AppText>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.tab, activeTab === 'latest' && styles.activeTab]}
//             onPress={() => setActiveTab('latest')}
//           >
//             <AppText weight='SemiBold' style={[styles.tabText, activeTab === 'latest' && styles.activeTabText]}>
//               LATEST
//             </AppText>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.tab, activeTab === 'trending' && styles.activeTab]}
//             onPress={() => setActiveTab('trending')}
//           >
//             <AppText weight='SemiBold' style={[styles.tabText, activeTab === 'trending' && styles.activeTabText]}>
//               TRENDING
//             </AppText>
//           </TouchableOpacity>
//         </View>

//         <FlatList
//           data={ads}
//           renderItem={renderItem}
//           keyExtractor={item => item._id}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <AppText weight='Inter' style={styles.emptyText}>No advertisements found</AppText>
//             </View>
//           }
//         />

//       </View>

//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'white',
//     paddingBottom: 50
//   },
//   logo: {
//     alignSelf: "center",
//     width: 100,
//     height: 50,
//   },
//   tabs: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   tab: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 15,
//   },
//   activeTab: {
//     borderBottomWidth: 2,
//     borderBottomColor: 'black',
//   },
//   tabText: {
//     fontSize: 12,
//     color: '#888',
//     letterSpacing: 2,
//   },
//   activeTabText: {
//     color: 'black',
//   },
//   listContent: {
//     paddingBottom: 20,
//   },
//   postContainer: {
//     marginTop: 20,
//     paddingHorizontal: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     paddingBottom: 20,
//   },
//   postHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   postTitle: {
//     textAlign: "center",
//     fontSize: 18,
//     color: 'black',
//     flex: 1,
//   },
//   videoContainer: {
//     width: '100%',
//     aspectRatio: 16 / 9,
//     borderRadius: 8,
//     overflow: 'hidden',
//     backgroundColor: '#f5f5f5',
//   },
//   video: {
//     width: '100%',
//     height: '100%',
//   },
//   image: {
//     width: '100%',
//     aspectRatio: 16 / 9,
//     borderRadius: 8,
//     backgroundColor: '#f5f5f5',
//   },
//   postDescription: {
//     fontSize: 14,
//     color: '#333',
//     marginTop: 10,
//     lineHeight: 20,
//     textAlign: "center",
//   },
//   postFooter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 15,
//     justifyContent: 'space-between',
//     paddingHorizontal: 10
//   },
//   actionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   actionText: {
//     fontSize: 14,
//     color: 'black',
//     marginLeft: 5,
//   },
//   addButton: {
//     position: 'absolute',
//     bottom: 30,
//     right: 30,
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: 'black',
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 5,
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'white',
//     padding: 20,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: 'black',
//   },
//   modalContent: {
//     flex: 1,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 15,
//     marginBottom: 15,
//     fontSize: 16,
//   },
//   descriptionInput: {
//     height: 100,
//     textAlignVertical: 'top',
//   },
//   typeSelector: {
//     flexDirection: 'row',
//     marginBottom: 15,
//   },
//   typeButton: {
//     flex: 1,
//     padding: 15,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     alignItems: 'center',
//   },
//   activeTypeButton: {
//     backgroundColor: '#f0f0f0',
//     borderColor: 'black',
//   },
//   featuredToggle: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   featuredText: {
//     marginLeft: 10,
//     fontSize: 16,
//   },
//   submitButton: {
//     backgroundColor: 'black',
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   submitButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 50,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#888',
//   },
// });

// export default MarketInsights;