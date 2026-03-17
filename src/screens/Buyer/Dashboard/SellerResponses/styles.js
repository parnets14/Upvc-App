// import { StyleSheet, Dimensions } from 'react-native';

// const { width, height } = Dimensions.get('window');

// export const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FA',
//     padding: 16,
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#1A1A1A',
//     marginBottom: 8,
//     fontFamily: 'Inter-SemiBold',
//   },
//   tipText: {
//     fontSize: 14,
//     color: '#5E5E5E',
//     fontFamily: 'Inter-Regular',
//     marginBottom: 20,
//     backgroundColor: '#FFF9E6',
//     padding: 12,
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#FFC107',
//   },
//   sellerContactCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   sellerContactInfo: {
//     marginBottom: 12,
//   },
//   sellerContactName: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1A1A1A',
//     fontFamily: 'Inter-SemiBold',
//     marginBottom: 4,
//   },
//   sellerContactSpecialty: {
//     fontSize: 14,
//     color: '#4CAF50',
//     fontFamily: 'Inter-Medium',
//     marginBottom: 8,
//   },
//   sellerContactPhone: {
//     fontSize: 16,
//     color: '#333333',
//     fontFamily: 'Inter-Medium',
//     marginBottom: 12,
//   },
//   videoButton: {
//     marginTop: 8,
//   },
//   videoThumbnailContainer: {
//     width: '100%',
//     height: 180,
//     borderRadius: 8,
//     overflow: 'hidden',
//     marginBottom: 8,
//     position: 'relative',
//   },
//   videoThumbnail: {
//     width: '100%',
//     height: '100%',
//   },
//   playButton: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.2)',
//   },
//   videoLinkText: {
//     fontSize: 14,
//     color: '#4CAF50',
//     fontFamily: 'Inter-Medium',
//     textAlign: 'center',
//   },
//   contactButtons: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginTop: 12,
//   },
//   callButton: {
//     backgroundColor: '#4CAF50',
//     borderRadius: 20,
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 12,
//   },
//   messageButton: {
//     backgroundColor: '#25D366',
//     borderRadius: 20,
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 12,
//   },
//   videoModalContainer: {
//     flex: 1,
//     backgroundColor: '#000',
//     justifyContent: 'center',
//   },
//   videoPlayer: {
//     width: '100%',
//     height: height * 0.6,
//   },
//   closeButton: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 50 : 30,
//     right: 20,
//     zIndex: 1,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     borderRadius: 20,
//     padding: 8,
//   },
//   controlsContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//   },
//   progressBarContainer: {
//     flex: 1,
//     height: 3,
//     backgroundColor: 'rgba(255,255,255,0.5)',
//     marginHorizontal: 10,
//   },
//   progressBar: {
//     height: '100%',
//     backgroundColor: '#4CAF50',
//   },
//   timeText: {
//     color: '#FFF',
//     fontSize: 12,
//     marginHorizontal: 5,
//   },
//   ctaButton: {
//     marginTop: 24,
//     marginBottom: 16,
//   },
// });




































import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    marginTop:20,
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap:10,
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
    paddingBottom: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    fontFamily: 'Inter-ExtraBold',
  },
  subHeader: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Inter-Medium',
  },
  listContainer: {
    paddingBottom: 24,
  },
  sellerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sellerHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  sellerSpecialty: {
    fontSize: 14,
    color: '#4CAF50',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between',
  },
  ratingText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  videoButton: {
    marginTop: 8,
  },
  videoThumbnailContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    alignItems: 'center',
  },
  watchText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 1,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  callButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  messageButton: {
    backgroundColor: '#25D366',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 10,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  videoModalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  videoTouchable: {
    flex: 1,
    justifyContent: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    zIndex: 1,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 12,
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  timeText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginHorizontal: 8,
    minWidth: 80,
    textAlign: 'center',
  },
  ctaButton: {
    marginTop: 15,
    // marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newButton: {
    backgroundColor: '#3F51B5', 
    marginTop: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});