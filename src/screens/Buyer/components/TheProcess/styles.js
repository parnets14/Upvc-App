import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  tabContentText: {
    fontSize: 16,
    color: 'black',
    marginBottom: 20,
  },
  descriptionContainer: {
    marginVertical: 10,
  },
  descriptionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: 'black',
    lineHeight: 22,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    marginVertical: 20,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: 'white',
    marginTop: 10,
  },
  carouselContainer: {
    paddingVertical: 30,
    backgroundColor: '#f8f8f8',
  },
  carouselTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 20,
  },
  carouselContent: {
    paddingHorizontal: 20,
  },
  carouselItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    height: 80,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 15,
  },
  carouselText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
});