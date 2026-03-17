import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    padding: 24,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 32,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Inter-ExtraBold',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Inter-Medium',
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  trendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  trendCard: {
    width: width * 0.43,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  trendCategory: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  trendChoice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Inter-Bold',
  },
  trendValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4CAF50',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
  },
  percentageBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  percentageText: {
    fontSize: 14,
    color: '#4CAF50',
    fontFamily: 'Inter-SemiBold',
  },
  adsContainer: {
    paddingBottom: 8,
  },
  adCard: {
    width: width * 0.6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  adImage: {
    width: '100%',
    height: 120,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'Inter-SemiBold',
    padding: 1,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    marginTop: 24,
  },
  button: {
    width: '48%',
  },
});