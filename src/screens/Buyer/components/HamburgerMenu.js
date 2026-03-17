// HamburgerMenu.js
import React, {useState, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, CommonActions} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import AppText from '../../../components/AppText'; 

const {width} = Dimensions.get('window');

const HamburgerMenu = () => {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [token, setToken] = useState(null);
  const slideAnim = useState(new Animated.Value(-300))[0];

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('buyerToken');
        setToken(storedToken);
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };

    fetchToken();
  }, []);

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const navigateTo = (screen) => {
    toggleMenu();
    navigation.navigate(screen);
  };

  const handleLogout = async () => {
    if (!token) {
      navigation.navigate('LoginScreen');
      return;
    }
    try {
      await AsyncStorage.clear();

      navigation.dispatch(
        CommonActions.reset({
          index: 0, 
          routes: [{name: 'BuyerMain'}],
        })
      );

      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Success',
        text2: 'Logged out successfully',
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error('Logout error:', error);
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error',
        text2: 'Failed to logout',
        visibilityTime: 3000,
      });
    }
  };

  const MenuItem = ({icon, title, onPress}) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Icon name={icon} size={24} color="#000" />
      <AppText style={styles.menuText}>{title}</AppText>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Icon name="menu" size={30} color="#000" />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={menuVisible}
        onRequestClose={toggleMenu}
        animationType="none"
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleMenu}
        >
          <Animated.View 
            style={[
              styles.menuContainer,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <View style={styles.menuHeader}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.menuLogo}
              />
              <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.mainitems}>
              <View>
                <MenuItem 
                  icon="home" 
                  title="Home"  
                  onPress={() => navigateTo('BuyerMain')}
                />
                <MenuItem 
                  icon="category" 
                  title="Category"  
                  onPress={() => navigation.navigate('BuyerMain', {screen: 'BuyerInsights'})} 
                />
                <MenuItem 
                  icon="history" 
                  title="History" 
                  onPress={() => navigation.navigate('BuyerMain', {screen: 'ActiveLeads'})} 
                />
                <MenuItem 
                  icon="account-circle" 
                  title="Account" 
                  onPress={() => navigation.navigate('BuyerMain', {screen: 'BuyerAccount'})} 
                />
              </View>
              
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <AppText weight="Inter" style={styles.logoutButtonText}>
                  {!token ? 'LOGIN' : 'LOGOUT'}
                </AppText>
                <Icon name="exit-to-app" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 300,
    height: '100%',
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuLogo: {
    width: 100,
    height: 40,
  },
  mainitems: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    paddingVertical: 20, 
  }, 
  closeButton: {
    padding: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    marginLeft: 20,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
    marginHorizontal: 10
  },
  logoutButtonText: {
    color: '#000',
    fontSize: 16, 
    letterSpacing: 1,
    marginRight: 10,
  },
});

export default HamburgerMenu;