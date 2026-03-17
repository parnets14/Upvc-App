import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  Linking,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppText from './AppText';

const ContactUsModal = ({ visible, onClose }) => {
  const scaleValue = new Animated.Value(0);
  const opacityValue = new Animated.Value(0);

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      scaleValue.setValue(0);
    }
  }, [visible]);

  const handleEmailPress = () => {
    const email = 'suren@upvcconnect.com';
    Linking.openURL(`mailto:${email}`).catch(err => {
      console.error('Error opening email:', err);
    });
  };

  const handleAddressPress = () => {
    const address = '14, 1st Main Road, Bank Avenue, Kalyan Nagar, Bangalore - 560043';
    const encodedAddress = encodeURIComponent(address);
    
    // Try to open in Google Maps
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    
    Linking.openURL(googleMapsUrl).catch(err => {
      console.error('Error opening maps:', err);
    });
  };

  const handleWebsitePress = () => {
    const website = 'https://www.upvcconnect.com';
    Linking.openURL(website).catch(err => {
      console.error('Error opening website:', err);
    });
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: opacityValue }]}>
        <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleValue }] }]}>
          <View style={styles.content}>
            <View style={styles.header}>
              <AppText weight="Inter" style={styles.title}>CONTACT US</AppText>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.companyInfo}>
              <AppText weight="Inter" style={styles.companyName}>UPVC Connect</AppText>
            </View>

            {/* Address */}
            <TouchableOpacity style={styles.contactItem} onPress={handleAddressPress}>
              <View style={styles.iconContainer}>
                <Icon name="location-on" size={24} color="#000" />
              </View>
              <View style={styles.contactTextContainer}>
                <AppText weight="Inter" style={styles.contactLabel}>Address</AppText>
                <AppText weight="Inter" style={styles.contactValue}>
                  14, 1st Main Road, Bank Avenue, Kalyan Nagar, Bangalore - 560043
                </AppText>
              </View>
            </TouchableOpacity>

            {/* Email */}
            <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
              <View style={styles.iconContainer}>
                <Icon name="email" size={24} color="#000" />
              </View>
              <View style={styles.contactTextContainer}>
                <AppText weight="Inter" style={styles.contactLabel}>Email</AppText>
                <AppText weight="Inter" style={styles.contactValue}>
                  suren@upvcconnect.com
                </AppText>
              </View>
            </TouchableOpacity>

            {/* Website */}
            <TouchableOpacity style={styles.contactItem} onPress={handleWebsitePress}>
              <View style={styles.iconContainer}>
                <Icon name="language" size={24} color="#000" />
              </View>
              <View style={styles.contactTextContainer}>
                <AppText weight="Inter" style={styles.contactLabel}>Website</AppText>
                <AppText weight="Inter" style={styles.contactValue}>
                  www.upvcconnect.com
                </AppText>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  content: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#000',
    fontSize: 18,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  closeButton: {
    padding: 4,
  },
  companyInfo: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  companyName: {
    fontSize: 20,
    color: '#000',
    letterSpacing: 0.5,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  contactValue: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
});

export default ContactUsModal;


