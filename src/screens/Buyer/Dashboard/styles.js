import {StyleSheet, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: { 
    backgroundColor: 'white',
  }, 
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom:20, 
  },
  logo: { 
    width: 100, 
    height: 50,   
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    letterSpacing: 1,
  },
  tabScrollContainer: {
    flexDirection:"row",
    justifyContent:"space-between", 
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
    fontWeight: '600',
    color: 'black',
    letterSpacing: 1,
  },
  activeTabText: {
    color: 'black',
  },
promptContainer: {
  // backgroundColor: '#fff',
  padding: 10,
  // borderRadius: 12,
  margin: 16,
  // borderWidth: 1,
  // borderColor: '#e5e5e5',
  // elevation: 2,
},

promptTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#000',
  marginBottom: 16,
},

cityWrap: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 10,
  marginBottom: 20,
},

cityButton: {
  backgroundColor: '#f0f0f0',
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 20,
  marginRight: 8,
  marginBottom: 10,
  borderWidth: 1,
  borderColor: '#ccc',
},

cityText: {
  color: '#333',
  fontSize: 14,
},

searchLocationBtn: {
  backgroundColor: '#000',
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: 'center',
},

searchLocationText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 15,
},

});