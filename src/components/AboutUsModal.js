import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppText from './AppText';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const AboutUsModal = ({ visible, onClose }) => {
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

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: opacityValue }]}>
        <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleValue }] }]}>
          <View style={styles.header}>
            <AppText weight="Inter" style={styles.title}>ABOUT US</AppText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
            nestedScrollEnabled={true}
          >
            <View style={styles.companyInfo}>
              <AppText weight="Inter" style={styles.companyName}>UPVC CONNECT</AppText>
              <AppText weight="Inter" style={styles.tagline}>
                India's first dedicated lead-generation and decision-support platform exclusively for UPVC windows and doors.
              </AppText>
            </View>

            <View style={styles.section}>
              <AppText weight="Inter" style={styles.sectionTitle}>Our Mission</AppText>
              <AppText weight="Inter" style={styles.sectionText}>
                We are on a mission to simplify one of the most confusing parts of home building and renovation—choosing the right windows, the right brand, and the right fabricator.
              </AppText>
            </View>

            <View style={styles.section}>
              <AppText weight="Inter" style={styles.sectionTitle}>The Challenge</AppText>
              <AppText weight="Inter" style={styles.sectionText}>
                Millions of homeowners struggle with:
              </AppText>
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <Icon name="check-circle" size={16} color="#000" style={styles.bulletIcon} />
                  <AppText weight="Inter" style={styles.bulletText}>Confusing technical jargon</AppText>
                </View>
                <View style={styles.bulletItem}>
                  <Icon name="check-circle" size={16} color="#000" style={styles.bulletIcon} />
                  <AppText weight="Inter" style={styles.bulletText}>Inconsistent pricing from sellers</AppText>
                </View>
                <View style={styles.bulletItem}>
                  <Icon name="check-circle" size={16} color="#000" style={styles.bulletIcon} />
                  <AppText weight="Inter" style={styles.bulletText}>Difficulty comparing profiles, hardware & glass</AppText>
                </View>
                <View style={styles.bulletItem}>
                  <Icon name="check-circle" size={16} color="#000" style={styles.bulletIcon} />
                  <AppText weight="Inter" style={styles.bulletText}>Finding verified and trustworthy UPVC window fabricators</AppText>
                </View>
              </View>
              <AppText weight="Inter" style={styles.sectionText}>
                We built this app to solve all of it.
              </AppText>
            </View>

            <View style={styles.section}>
              <AppText weight="Inter" style={styles.sectionTitle}>What We Do</AppText>
              <AppText weight="Inter" style={styles.sectionText}>
                UPVC CONNECT hand-holds buyers through every step of the UPVC window purchasing journey—right from understanding the basics to selecting the most reliable fabricators near them.
              </AppText>
              <AppText weight="Inter" style={styles.sectionSubtitle}>
                Our platform offers:
              </AppText>
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <Icon name="square" size={16} color="#4CAF50" style={styles.bulletIcon} />
                  <AppText weight="Inter" style={styles.bulletText}>Personalized recommendations based on your project needs</AppText>
                </View>
                <View style={styles.bulletItem}>
                  <Icon name="square" size={16} color="#4CAF50" style={styles.bulletIcon} />
                  <AppText weight="Inter" style={styles.bulletText}>Transparent comparisons of UPVC profiles, glass options & hardware</AppText>
                </View>
                <View style={styles.bulletItem}>
                  <Icon name="square" size={16} color="#4CAF50" style={styles.bulletIcon} />
                  <AppText weight="Inter" style={styles.bulletText}>Verified fabricators & trusted sellers across India</AppText>
                </View>
                <View style={styles.bulletItem}>
                  <Icon name="square" size={16} color="#4CAF50" style={styles.bulletIcon} />
                  <AppText weight="Inter" style={styles.bulletText}>Smart lead-matching to connect you with the right professionals</AppText>
                </View>
                <View style={styles.bulletItem}>
                  <Icon name="square" size={16} color="#4CAF50" style={styles.bulletIcon} />
                  <AppText weight="Inter" style={styles.bulletText}>Expert guidance to help you make confident decisions</AppText>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <AppText weight="Inter" style={styles.sectionTitle}>Why We Built It</AppText>
              <AppText weight="Inter" style={styles.sectionText}>
                UPVC windows are a long-term investment. Yet, most customers do not have access to unbiased information or reliable sellers. The result? Wrong choices, overspending, or poor installation.
              </AppText>
              <AppText weight="Inter" style={styles.sectionText}>
                Our team, with years of experience in the UPVC and building materials industry, created this app so buyers can make the right decision—quickly, confidently, and without confusion.
              </AppText>
            </View>

            <View style={styles.section}>
              <AppText weight="Inter" style={styles.sectionTitle}>Our Commitment</AppText>
              <AppText weight="Inter" style={styles.sectionText}>
                We are committed to:
              </AppText>
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <Icon name="check-circle" size={16} color="#000" style={styles.bulletIcon} />
                  <AppText weight="Inter" style={styles.bulletText}>Offering genuine, unbiased information</AppText>
                </View>
                <View style={styles.bulletItem}>
                  <Icon name="check-circle" size={16} color="#000" style={styles.bulletIcon} />
                  <AppText weight="Inter" style={styles.bulletText}>Connecting you only with verified, quality-driven fabricators</AppText>
                </View>
                <View style={styles.bulletItem}>
                  <Icon name="check-circle" size={16} color="#000" style={styles.bulletIcon} />
                  <AppText weight="Inter" style={styles.bulletText}>Ensuring a smooth and transparent buying process</AppText>
                </View>
                <View style={styles.bulletItem}>
                  <Icon name="check-circle" size={16} color="#000" style={styles.bulletIcon} />
                  <AppText weight="Inter" style={styles.bulletText}>Making the UPVC window experience stress-free for every homeowner</AppText>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <AppText weight="Inter" style={styles.closingText}>
                Whether you are building a new home or upgrading your existing one, UPVC CONNECT ensures you choose windows that last for decades.
              </AppText>
            </View>
          </ScrollView>
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
    paddingVertical: 40,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    height: SCREEN_HEIGHT * 0.8,
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 30,
  },
  companyInfo: {
    marginBottom: 24,
  },
  companyName: {
    fontSize: 22,
    color: '#000',
    letterSpacing: 0.5,
    marginBottom: 12,
    fontWeight: '600',
  },
  tagline: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 12,
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    marginBottom: 8,
    fontWeight: '500',
  },
  sectionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletList: {
    marginTop: 8,
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletIcon: {
    marginRight: 10,
    marginTop: 3,
  },
  bulletText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    flex: 1,
  },
  closingText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
});

export default AboutUsModal;


